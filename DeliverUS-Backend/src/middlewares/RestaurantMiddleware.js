import { Restaurant, Order } from '../models/models.js'
import { Sequelize } from 'sequelize'

const checkRestaurantOwnership = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.restaurantId)
    if (req.user.id === restaurant.userId) {
      return next()
    }
    return res.status(403).send('Not enough privileges. This entity does not belong to you')
  } catch (err) {
    return res.status(500).send(err)
  }
}

const checkNoOtherPromoted = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.restaurantId)
    const otherPromotedRestaurant = await Restaurant.findOne({
      where: {
        promoted: true,
        id: { [Sequelize.Op.ne]: restaurant.id }
      }
    })
    if (otherPromotedRestaurant) {
      return res.status(422).send('There is already some promoted restaurant')
    }
    return next()
  } catch (error) {
    return res.status(500).send(error)
  }
}

const restaurantHasNoOrders = async (req, res, next) => {
  try {
    const numberOfRestaurantOrders = await Order.count({
      where: { restaurantId: req.params.restaurantId }
    })
    if (numberOfRestaurantOrders === 0) {
      return next()
    }
    return res.status(409).send('Some orders belong to this restaurant.')
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

export { checkRestaurantOwnership, restaurantHasNoOrders, checkNoOtherPromoted }
