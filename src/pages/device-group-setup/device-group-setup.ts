import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';

import { DeviceAccountProvider, IDeviceGroupData } from "../../providers/device-account/device-account";
import { UserProfileSetupPage } from "../user-profile-setup/user-profile-setup";


@Component({
  selector: 'page-device-group-setup',
  templateUrl: 'device-group-setup.html',
})
export class DeviceGroupSetupPage implements OnInit {

  private groups: Array<IDeviceGroupData> = []

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public alertCtrl: AlertController,
              public deviceAccount: DeviceAccountProvider) {

  }

  ngOnInit(): void {
    this.deviceAccount.getDeviceGroups()
      .then((groups: Array<IDeviceGroupData>) => {
        this.groups = groups
      })
      .catch(err => {
        console.log('Could not load device groups.')
        console.log(err)
      })
  }

  private showCreateGroupDialog() {
    let prompt = this.alertCtrl.create({
      title: 'Device Group Name',
      message: 'Enter a name for the new device group',
      inputs: [{
        name: 'groupName',
        value: 'Home'
      }],
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Save',
          handler: data => {
            this.createGroup(data['groupName'])
          }
        }
      ]
    });
    prompt.present();

  }

  private createGroup(groupName: string) {
    this.deviceAccount.createDeviceGroup({name: groupName})
      .then((group: IDeviceGroupData) => {
        this.selectGroup(group)
      })
      .catch(err => {
        console.log('Could not create device group.')
        console.log(err)
      })
  }

  private selectGroup(group: IDeviceGroupData) {
    this.deviceAccount.selectDeviceGroup(group).then(() => {
      this.navCtrl.pop()
    })
    .catch(err => {
      console.log('Could not select device group.')
      console.log(err)
    })
  }

}
