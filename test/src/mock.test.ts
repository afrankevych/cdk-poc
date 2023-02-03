import {mock} from "../../src/mock";

describe('Mocked input', () => {
    it('should mock the input', () => {
        expect(mock('hello world')).toStrictEqual('HelLo WorLd 🤡🤡');
    });
});