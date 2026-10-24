import { Client } from "../src/Client";
import { Service } from "../src/Service";
import { mock, instance, spy, when, verify, anything } from "@typestrong/ts-mockito";

describe("m4 integrated test", () => {
  let mockService: Service;
  let mockServiceInstance: Service;
  let client: Client;
  let spyClient: Client;
  let spyClientInstance: Client;

  /**
   * This function is run before each test. We can use it to set up our mock objects with Mockito.
   */
  beforeEach(() => {
    mockService = mock(Service);
    mockServiceInstance = instance(mockService);

    client = new Client();
    spyClient = spy(client);  
    spyClientInstance = instance(spyClient);

    // TODO: Use the ts-mokito when/thenReturn to tell the spyClient (not the client) 
    // to return the instance of the mock service when the factory method is called
    when(spyClient.createService()).thenReturn(mockServiceInstance);
  });

  /**
   * This is supposed to test whether the code in the Client is correct. The Client code is correct,
   *     but the Service has a bug that causes this test to fail. Using Mockito we can test the Client
   *     without also testing the Service
   */
  it("testConvertValue", () => {
    const expected: string = "70";

    // TODO: Use ts-mockito when/thenReturn to tell the mock service (not the instance of the mock service) to return 2 for input 35 when it's getDecimalDigitCount(int) method is called
    when(mockService.getDecimalDigitCount(35)).thenReturn(2);
    // TODO: Change this to use the spyClientInstance
    const actual: string = spyClientInstance.convertValue(35);

    expect(actual).toBe(expected);
  });

  /**
   * This test passes, but it doesn't actually test anything. We have no assurance
   *     that the Client's code is correct, since the function has no return value for us to
   *     check. However, we can use Mockito to check the parameters passed to the Service
   *     in order to see whether the Client has correct code.
   */
  it("testCreateFormattedStringsWithAnswer", () => {
  when(mockService.processList(anything())).thenCall(
    (strings: string[]) => {
      expect(strings).not.toBeNull();
      expect(strings).toEqual(["HAVE", "A", "NICE", "DAY"]);
    }
  );

  const input = "Have a nice day";
  spyClientInstance.createFormattedStrings(input);

  verify(mockService.processList(anything())).once();
});
});
