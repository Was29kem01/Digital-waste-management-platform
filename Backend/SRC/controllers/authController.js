const authServices = require("../services/authServices");


const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        const user = await authServices.register(
            name,
            email,
            password
        );

        return res.status(201).json({ 
            message: "User registered successfully", 
            user,
         });
        } catch (error) {
        return res.status(400).json({
             message: error.message,
             });
    };
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const data = await authServices.login(email, password);

        return res.status(200).json({ 
            message: "Login successful", 
            ...data
        });
    } catch (error) {
        return res.status(401).json({
             message: error.message,
        });
    }
};

module.exports = {
    register,
    login,
};