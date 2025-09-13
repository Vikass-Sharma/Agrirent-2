const cors = require('cors');
const express = require('express');
const path = require('path');
const fs = require('fs');

const setupMiddleware = (app) => {
  // CORS middleware
  app.use(cors());
  
  // JSON parsing middleware
  app.use(express.json());
};

module.exports = setupMiddleware;
