import { Injectable } from '@angular/core';

import { IFederatedIdentityProfile } from "../federated-identity";


@Injectable()
export class DeviceProfile implements IFederatedIdentityProfile {

  constructor() {

  }

	getPicture(): Promise<string> {
		throw new Error("Method not implemented.");
	}

	getLastName(): Promise<string> {
		throw new Error("Method not implemented.");
	}

	getFirstName(): Promise<string> {
		throw new Error("Method not implemented.");
	}

}
