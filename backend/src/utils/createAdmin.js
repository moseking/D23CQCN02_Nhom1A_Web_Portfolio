const bcrypt =
  require("bcryptjs");

const User =
  require("../models/User");

const createAdmin =
  async () => {
    try {
      const existingAdmin =
        await User.findOne({
          role: "admin",
        });

      if (existingAdmin) {
        if (!existingAdmin.isVerified) {
          existingAdmin.isVerified =
            true;
          existingAdmin.verifyOTP =
            undefined;
          existingAdmin.verifyOTPExpire =
            undefined;

          await existingAdmin.save();
        }

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

        isVerified: true,
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
