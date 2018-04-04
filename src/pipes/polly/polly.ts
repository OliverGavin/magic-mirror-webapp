import { Pipe, PipeTransform, Inject } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/concat';
import { SynthesizeSpeechOutput } from "aws-sdk/clients/polly";

import { PollyProvider } from '../../providers/polly/polly'
import { IDENTITY_PROVIDER_IT, IdentityProvider } from "../../providers/federated-identity/federated-identity";


export interface IPollyTextData {
  text: string
  ssml?: string
}


@Pipe({
  name: 'polly',
})
export class PollyPipe implements PipeTransform {

  constructor(@Inject(IDENTITY_PROVIDER_IT)private identity: IdentityProvider, private polly: PollyProvider) {

  }

  transform(data: string | IPollyTextData | Observable<string | IPollyTextData>, ...args) {

    if (data == undefined)
      return

    if (typeof data === 'string')
      data = {text: data}

    if ((<IPollyTextData>data).text !== undefined)
      data = Observable.from([<IPollyTextData> data]);

    const input: Observable<IPollyTextData> = (<Observable<string | IPollyTextData>> data)
      .map((d: string | IPollyTextData) => {
        if (typeof d === 'string') {
          d = <IPollyTextData>{text: d}
        }
        return <IPollyTextData> d
      })
      .filter(d => !!d)

    let textObservable: Observable<string | void> = input.map(value => value.text)

    let audioObservable: Observable<SynthesizeSpeechOutput | void> = input.concatMap(value => {
      let text, type: string
      [text, type] = value.ssml ? [value.ssml, 'ssml'] : [value.text, 'text']

      let promise = Promise.resolve()
      .then(() =>
        this.identity.isAuthenticated()
      )
      .then(() =>
        this.polly.textToSpeech(text, type)
      )
      .catch(err => console.log(err))

      return Observable.fromPromise(promise)
    })

    textObservable = textObservable.concat(Observable.of(null))
    audioObservable = Observable.of(null).concat(audioObservable)

    const outputObservable = Observable.zip(textObservable, audioObservable)

    return outputObservable.concatMap(([text, audio]: [string, SynthesizeSpeechOutput]) => {

      const promise = new Promise<string>((resolve) => {
        if (audio) {
          const player = new Audio()
          const blob = new Blob([audio.AudioStream], {'type': 'audio/mp3'});
          const url = URL.createObjectURL(blob)
          player.src = url
          player.load()
          player.play()
          player.addEventListener("ended", () => {  // Wait until audio completes
            resolve(text)
          })
        }
        else {
          resolve(text)
        }
      })
      .catch(err => console.log(err))

      return Observable.fromPromise(promise)
                       .filter(x => !!x).delay(1000)  // spacing

    })
    .concat(Observable.of(null).delay(3000))  // hide

  }

}
