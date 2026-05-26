const bcrypt =
  require("bcryptjs");

const User =
  require("../models/User");

const createAdmin =
  async () => {
    try {
      const existingAdmin =
        await User.findOne({
          email:
            "admin@gmail.com",
        });

      if (existingAdmin) {
        console.log(
          "Admin already exists"
        );

        return;
      }

      const hashedPassword =
        await bcrypt.hash(
          "admin123",
          10
        );

      await User.create({
        username: "admin",

        email:
          "admin@gmail.com",

        password:
          hashedPassword,

        role: "admin",

        status: "active",
      });

      console.log(
        "Admin created"
      );
    } catch (error) {
      console.log(error);
    }
  };

module.exports =
  createAdmin;