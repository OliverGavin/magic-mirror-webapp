import { Pipe, PipeTransform } from '@angular/core';
import { PollyProvider } from '../../providers/polly/polly'
import { SynthesizeSpeechOutput } from "aws-sdk/clients/polly";
import { CognitoAuthProvider } from "../../providers/cognito-auth/cognito-auth";


export interface IPollyTextData {
  text: string
  ssml: string
}


@Pipe({
  name: 'polly',
})
export class PollyPipe implements PipeTransform {

  constructor(private auth: CognitoAuthProvider, private polly: PollyProvider) {

  }

  transform(value: string | IPollyTextData, ...args) {
    let text: string
    let type: string
    [text, type] = value && value.text && value.ssml ? [value.ssml, 'ssml'] : [value, 'text']

    if (text)
      this.auth.getSession().then(() => {
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
