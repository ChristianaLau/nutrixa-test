"use strict";

const path = require('path');

// Absolute path to user.modal.jsx
const resolvedUserModalPath = path.resolve('/home/okamieme/nutrixa-18/nutrixa-auth/lib/modals/user.modal.jsx');
const resolvedDbPath = path.resolve('/home/okamieme/nutrixa-18/nutrixa-auth/lib/db.jsx');

console.log("Current directory:", __dirname);
console.log("Resolved UserModel path:", resolvedUserModalPath);
console.log("Resolved DB path:", resolvedDbPath);

delete require.cache[resolvedUserModalPath]; 

try {
  const UserModel = require(resolvedUserModalPath);
  console.log("UserModel loaded successfully:", UserModel);
  
  const { connect } = require(resolvedDbPath);

  async function createUser(user) {
    try {
      await connect();
      const newUser = await UserModel.create(user);
      return JSON.parse(JSON.stringify(newUser));
    } catch (error) {
      console.error("Error creating user:", error);
      throw error; // Ensure the error is propagated
    }
  }

  // Inline test code
  // async function testCreateUser() {
  //   try {
  //     // Mock user data
  //     const mockUser = {
  //       clerkId: "testabc",
  //       email: "testabc@example.com",
  //       username: "testuserabc",
  //       firstName: "Test",
  //       lastName: "User",
  //       photo: "https://example.com/photo.jpg",
  //       weight: 70,
  //       diets: ["vegan"]
  //     };

  //     console.log("Creating user with mock data:", mockUser);
  //     const newUser = await createUser(mockUser);

  //     // Assertions
  //     if (newUser) {
  //       console.log("User created successfully:", newUser);
  //       // Add more assertions as needed
  //     } else {
  //       console.error("Failed to create user.");
  //     }
  //   } catch (error) {
  //     console.error("Error during createUser test:", error);
  //   }
  // }

  // // Run the test function
  // testCreateUser();

} catch (error) {
  console.error("Error loading UserModel:", error);
}
