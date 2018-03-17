import { Pipe, PipeTransform, Inject } from '@angular/core';
import { PollyProvider } from '../../providers/polly/polly'
import { SynthesizeSpeechOutput } from "aws-sdk/clients/polly";
import { IDENTITY_PROVIDER_IT, IdentityProvider } from "../../providers/federated-identity/federated-identity";


export interface IPollyTextData {
  text: string
  ssml: string
}


@Pipe({
  name: 'polly',
})
export class PollyPipe implements PipeTransform {

  constructor(@Inject(IDENTITY_PROVIDER_IT)private identity: IdentityProvider, private polly: PollyProvider) {

  }

  transform(value: string | IPollyTextData, ...args) {
    let text: string
    let type: string
    [text, type] = value && value.text && value.ssml ? [value.ssml, 'ssml'] : [value, 'text']

    if (text)
      this.identity.isAuthenticated().then(() => {
        this.polly.textToSpeech(text, type)
          .then((audio: SynthesizeSpeechOutput) => {
            let player = new Audio()
            let blob = new Blob([audio.AudioStream], {'type': 'audio/mp3'});
            let url = URL.createObjectURL(blob)
            player.src = url
            player.load()
            player.play()
          })
          .catch(err => {
            console.log(err)
          })
      })
      .catch(err => console.log(err))

    return value
  }
}
