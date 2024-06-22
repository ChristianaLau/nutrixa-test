"use strict";

const { clerkClient } = require("@clerk/nextjs");
const { Webhook } = require("svix");
const { createUser } = require("@/lib/actions/user.actions");
const { headers } = require("next/headers");
const { NextResponse } = require("next/server");

async function POST(req) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = headers(req);
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // Log headers
  console.log("Webhook Headers:", { svix_id, svix_timestamp, svix_signature });

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing svix headers");
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  console.log("Webhook Payload:", body);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with ID ${id} and type ${eventType}`);

  if (eventType === "user.created") {
    const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;

    const user = {
      clerkId: id,
      email: email_addresses[0].email_address,
      username: username,
      firstName: first_name,
      lastName: last_name,
      photo: image_url,
    };

    console.log("User data from webhook:", user);

    try {
      const newUser = await createUser(user);
      console.log("New user created:", newUser);

      await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: {
          userId: newUser._id,
        },
      });

      return NextResponse.json({ message: "New user created", user: newUser });
    } catch (error) {
      console.error("Error creating user in MongoDB:", error);
      return new Response("Error creating user", {
        status: 500,
      });
    }
  }

  return new Response("", { status: 200 });
}

module.exports = {
  POST,
};
