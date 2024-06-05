const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')

const register = async (req, res) => {
  const user = await User.create({ ...req.body })
  const token = user.createJWT()
  res.status(StatusCodes.CREATED).json({ user: { email: user.email, lastName: user.lastName, location: user.location, name: user.name, token } })
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new BadRequestError('Please provide email and password')
  }
  const user = await User.findOne({ email })
  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  // compare password
  const token = user.createJWT()
  res.status(StatusCodes.OK).json({ user: { email: user.email, lastName: user.lastName, location: user.location, name: user.name, token } })
}

const updateUser = async (req, res) => {
  console.log(req.user);
  console.log(req.body);
  const {
    body: { email, lastName, location, name },
    user: { userId }
  } = req
  
  if (email === '' || lastName === '' || location === '' || name === '') {
    throw new BadRequestError('Email or LastName or Location or Name fields cannot be empty')
  }
  
  const user = await User.findByIdAndUpdate(
    { _id: userId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  )
  
  if (!user) {
    throw new NotFoundError(`No user with id ${userId}`)
  }
  // get new Token with updated value
  const token = user.createJWT()
  res.status(StatusCodes.CREATED).json({ user: { email: user.email, lastName: user.lastName, location: user.location, name: user.name, token } })
}

module.exports = {
  register,
  login,
  updateUser
}
