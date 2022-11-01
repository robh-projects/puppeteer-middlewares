//@ts-nocheck
import {jest} from '@jest/globals';


export function mockPartially(packageName: string, getMocks: (actualModule: any) => any) {
    jest.doMock(packageName, () => {
      const actualModule = jest.requireActual(packageName);
      const mocks = getMocks(actualModule);
        ///@ts-ignore
      return new Proxy(actualModule, {
        get: (target, property) => {
          if (property in mocks) {
            return mocks[property];
          } else {
            return target[property];
          }
        },
      });
    });
  }