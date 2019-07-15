'use strict';

const ValidationContract = require('../validators/fluent-validator');
const repository = require('../repositories/customer-repository');
const md5 = require('md5');
const authService = require('../services/auth-service');

exports.post = async(req, res, next) => {
  let contract = new ValidationContract();

  contract.hasMinLen(req.body.name, 3, 'Name should have at least 6 characters');
  contract.isEmail(req.body.email, 'Invalid email');
  contract.hasMinLen(req.body.password, 6, 'Passowrd should have at least 6 characters');

  if (!contract.isValid()) {
    res.status(400).send(contract.errors()).end();
    return;
  }

  try {
    await repository.create({
      name: req.body.name,
      email: req.body.email,
      password: md5(req.body.password + global.SALT_KEY)
    });

    res.status(201).send({
      message: 'Customer registered successfully!'
    });
  } catch (e) {
    res.status(500).send({
      message: 'Failed to register customer'
    });
  }
};

exports.authenticate = async(req, res, next) => {
  try {
    const customer = await repository.authenticate({
      email: req.body.email,
      password: md5(req.body.password + global.SALT_KEY)
    });

    if (!customer) {
      res.status(400).send({
        message: 'Invalid username or password'
      });
      return;
    }

    const token = await authService.generateToken({
      id: customer._id,
      email: customer.email,
      name: customer.name
    });

    res.status(201).send({
      token: token,
      data: {
        email: customer.email,
        name: customer.name
      }
    });
  } catch (e) {
    res.status(500).send({
      message: 'Failed to proccess your request'
    });
  }
};

exports.refreshToken = async(req, res, next) => {
  try {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    const data = await authService.decodeToken(token);

    const customer = await repository.getById(data.id);

    if (!customer) {
      res.status(400).send({
        message: 'User not found'
      });
      return;
    }

    const tokenData = await authService.generateToken({
      id: customer._id,
      email: customer.email,
      name: customer.name
    });

    res.status(201).send({
      token: tokenData,
      data: {
        email: customer.email,
        name: customer.name
      }
    });
  } catch (e) {
    res.status(500).send({
      message: 'Failed to proccess your request'
    });
  }
};
