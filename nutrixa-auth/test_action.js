const { createUser } = require("./lib/actions/user.actions");

describe("createUser function", () => {
  it("should create a new user", async () => {
    const newUser = await createUser(mockUser);

    // Assert that createUser returns the expected user object
    expect(newUser).toBeDefined();
    expect(newUser.clerkId).toEqual(mockUser.clerkId);
    // Add more assertions as per your data structure
  });

  it("should handle errors", async () => {
    // Mocking a scenario where connect() or UserModel.create() throws an error
    const mockError = new Error("Database connection error");
    jest.spyOn(require("@/lib/db"), "connect").mockRejectedValue(mockError);

    // Calling createUser with mockUser should now throw an error
    await expect(createUser(mockUser)).rejects.toThrowError(
      "Database connection error"
    );
  });
});
