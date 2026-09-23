const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const register = async (name, email, password) => {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new Error("User already exists with this email");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        }
    });

    // Exclude password from the returned object
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

const login = async (email, password) => {
    const user = await prisma.user.findUnique({
        where: { email },
        include: { branch: true } // Include branch details
    });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid email or password");
    }

    // Generate JWT
    const token = jwt.sign(
        { id: user.id, role: user.role, branchId: user.branchId, branchName: user.branch?.name },
        JWT_SECRET,
        { expiresIn: "7d" } // 1 week
    );

    const { password: _, branch, ...userWithoutPassword } = user;
    
    // Attach branchName directly to the user object for the frontend
    const userForFrontend = {
      ...userWithoutPassword,
      branchName: branch ? branch.name : null
    };

    return {
        user: userForFrontend,
        token
    };
};

module.exports = {
    register,
    login,
};
