const Service = require('../models/service.model');
const asyncHandler = require('../utils/asyncHandler');

exports.createService = asyncHandler(async (req, res) => {
  const { serviceName, description, price, duration, availabilityStatus } = req.body;

  if (!serviceName || !description || price === undefined || duration === undefined) {
    return res.status(400).json({ message: 'Service name, description, price and duration are required' });
  }

  const service = await Service.create({
    serviceName,
    description,
    price,
    duration,
    availabilityStatus: availabilityStatus !== undefined ? availabilityStatus : true,
  });

  res.status(201).json(service);
});

exports.getServices = asyncHandler(async (req, res) => {
  const services = await Service.find();
  res.status(200).json(services);
});

exports.getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    return res.status(404).json({ message: 'Service not found' });
  }
  res.status(200).json(service);
});

exports.updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    return res.status(404).json({ message: 'Service not found' });
  }

  const updates = {};
  if (req.body.serviceName !== undefined) updates.serviceName = req.body.serviceName;
  if (req.body.description !== undefined) updates.description = req.body.description;
  if (req.body.price !== undefined) updates.price = req.body.price;
  if (req.body.duration !== undefined) updates.duration = req.body.duration;
  if (req.body.availabilityStatus !== undefined) updates.availabilityStatus = req.body.availabilityStatus;

  Object.assign(service, updates);
  await service.save();

  res.status(200).json(service);
});

exports.deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    return res.status(404).json({ message: 'Service not found' });
  }

  await service.remove();
  res.status(200).json({ message: 'Service deleted successfully' });
});
