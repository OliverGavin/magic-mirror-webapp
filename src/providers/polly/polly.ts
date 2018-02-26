import { Injectable } from '@angular/core';
import { Polly } from 'aws-sdk'
import { SynthesizeSpeechOutput } from "aws-sdk/clients/polly";


@Injectable()
export class PollyProvider {

  constructor() {
    // TODO: Inject a provider interface for configuration (concrete loads from profile?)
  }

  public textToSpeech(text: string, type: string = 'text'): Promise<SynthesizeSpeechOutput> {
    return new Promise<SynthesizeSpeechOutput>((resolve, reject) => {
      const polly = new Polly({
          region: 'eu-west-1'
      })

      let params = {
          'Text': text,
          'TextType': type,
          'OutputFormat': 'mp3',
          // 'SampleRate': '8000',
          'VoiceId': 'Amy'
      }

      polly.synthesizeSpeech(params, (err, data) =>
          err ? reject(err) : resolve(data)
      )
    })

  }

}
