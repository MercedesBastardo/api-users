const catchError = require('../utils/catchError');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail.js');
const EmailCode = require('../models/EmailCode');


const getAll = catchError(async(req, res) => {
    const results = await User.findAll();
    return res.json(results);
});

const create = catchError(async(req, res) => {
    const {email, password, firstName, lastName, genre, perfilePhoto, birthDay, phone, frontBaseUrl } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await User.create({
        email, 
        password : hashedPassword, 
        firstName, 
        lastName, 
        genre, 
        perfilePhoto, 
        birthDay, 
        phone, 
        frontBaseUrl,
    });
    const code = require('crypto').randomBytes(32).toString("hex");
    const link = `${frontBaseUrl}/verify_email/${code}`;
    
    await sendEmail({
        to: email,
        subject:"User app email verification",
        html:`
            <h1>Hello ${firstName}!</h1>
            <p> Were almost done</p>
            <p> Go to the following link to verify your mail </p>
            <a href="${link}"> ${link} </a>
            `
    });

    await EmailCode.create({code, UserId: result.id});

    return res.status(201).json(result);
});

const getOne = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await User.findByPk(id);
    if(!result) return res.sendStatus(404);
    return res.json(result);
});

const remove = catchError(async(req, res) => {
    const { id } = req.params;
    await User.destroy({ where: {id} });
    return res.sendStatus(204);
});

const update = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await User.update(
        req.body,
        { where: {id}, returning: true }
    );
    if(result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);
});

const verifyEmail = catchError(async(req,res) => {
    const { code } = req.params;
    const emailCode = await EmailCode.findOne({where : {code}});
    if(!emailCode) return res.status(401).json({message:"Invalided Code"});

    await User.update(
        {isVerified: true},
        {where: {id: emailCode.UserId}}
    );

    await emailCode.destroy();

    return res.json(emailCode)
})

const login = catchError(async(req,res) => {
    // comparando email
    const { email, password } = req.body;
    const user = await User.findOne({where : {email}});
    if(!user) return res.status(401).json({error: "Invalid credentials"});
    if(!user.isVerified) return res.status(401).json({ error: "invalid credentials" });
    // comparando contraseña
    const isValid = await bcrypt.compare(password, user.password);
    if(!isValid) return res.status(401).json({error: "Invalid credencials"});

    const token = jwt.sign(
        { user },
        process.env.TOKEN_SECRET,
        { expiresIn: '3d' }
    )

    return res.status(201).json({user, token});
}); 

const getLoggetUser = catchError(async(req,res) => {
    const user= req.user;

    return res.json(user)
});


module.exports = {
    getAll,
    create,
    getOne,
    remove,
    update,
    login,
    verifyEmail,
    getLoggetUser
}