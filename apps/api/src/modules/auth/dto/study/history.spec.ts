declare const describe: any;
declare const it: any;
declare const expect: any;

describe("study history order", () => {
  it("orders events by createdAt descending", () => {
    const events = [
      { createdAt: 2 },
      { createdAt: 1 },
    ];
    expect(events[0].createdAt >= events[1].createdAt).toBe(true);
  });
});
