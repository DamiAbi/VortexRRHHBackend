import generateJWT from "../helpers/token-sign";
import User from "../model/user";
import bcrypt from "bcrypt";

import crypto from 'crypto';
import sendEmail from '../helpers/sendEmail';


export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Failed to get users.",
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        message: "The email adress is already registered.",
      });
    }
    const newUser = new User(req.body);
    const salt = bcrypt.genSaltSync(10);
    newUser.password = bcrypt.hashSync(req.body.password, salt);
    await newUser.save();
    res.status(201).json({
      message: "New user created succesfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Failed to create new user.",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "User not found.",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndUpdate(userId, req.body);
    res.status(200).json({
      message: "User updated succesfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Failed to update user.",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Failed to delete user.",
    });
  }
};

export const login = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "Incorrect email or password." });
    }
    const invalidPassword = bcrypt.compareSync(
      req.body.password,
      user.password
    );
    if (!invalidPassword) {
      return res.status(400).json({ message: "Incorrect email or password." });
    }
    const token = await generateJWT(user.name);
    res.status(200).json({
      message: "El usuario es correcto",
      name: user.name,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error al intentar loguear un user",
    });
  }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Crear un token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutos

    await user.save();

    const resetUrl = `${req.protocol}://${req.get('host')}/vortex-rrhh/user/reset-password/${resetToken}`;

    const message = `Ha solicitado un restablecimiento de contraseña. Haga clic en el siguiente enlace para restablecerla: \n\n${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Recuperación de contraseña',
            message,
        });

        res.status(200).json({ message: 'Correo enviado con éxito.' });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(500).json({ message: 'No se pudo enviar el correo.' });
    }
};

export const resetPassword = async (req, res) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    user.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: 'Contraseña restablecida con éxito.' });
};
