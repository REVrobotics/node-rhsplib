import { RevHubError } from "./RevHubError.js";

//Taken from https://github.com/apollographql/invariant-packages/blob/779f525d6b475653050cb17976753de287e30f91/packages/ts-invariant/src/invariant.ts#L2-L7
/*
Copyright (c) 2019 Apollo GraphQL

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

---

Modified to use Object.setPrototypeOf instead of __proto__ and to be a global
function
 */
export function setPrototypeOf(obj: any, proto: any) {
    Object.setPrototypeOf(obj, proto);
    return obj;
}

export class NackError extends RevHubError {
    nackCode: number;
    constructor(nackCode: number, message: string = "NACK error") {
        super(message);

        this.nackCode = nackCode;
        setPrototypeOf(this, NackError.prototype);
    }
}
