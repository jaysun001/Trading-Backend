const User = require("../models/User");
const Order = require("../models/Order");

exports.getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("userId -->", userId);
    if (!userId) {
      return res.json({
        message: "User id is invalid",
        success: false,
      });
    }
    
    console.log("req.user", req.user);
     
    if (req.user.sub !== userId) {
      return res.json({
        message: "You are not authorized to access this user's details",
        success: false,
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        message: "user is invalid",
        success: false,
      });
    }
    const dataPayload = {
      email: user.email,
      name: user.name,
      walletBalance: user.walletBalance,
      crdScore: user.crdScore,
      uid: user.uid,
    };
    return res.json({
      message: "User details fetched successfully",
      success: true,
      data: dataPayload,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log("getting error in getUserDetail controller -->", error);
    }
    return res.status(500).json({
      msg: "Internal Server Error",
      success: false,
    });
  }
};

exports.getUserWalletBalance = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.json({
        message: "User id is invalid",
        success: false,
      });
    }
    if (req.user.sub !== userId) {
      return res.json({
        message: "You are not authorized to access this user's details",
        success: false,
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        message: "user is invalid",
        success: false,
      });
    }
    const dataPayload = {
      walletBalance: user.walletBalance,
    };
    return res.json({
      message: "User wallet balance fetched successfully",
      success: true,
      data: dataPayload,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log("getting error in createOrder controller -->", error);
    }
    return res.status(500).json({
      msg: "Internal Server Error",
      success: false,
    });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const {
      BuyAmount,
      DeliveryPrice,
      Direction,
      Name,
      OpeningPrice,
      TermCode,
      Time,
      deliveryTime,
      openingTime,
      profit,
    } = req.body;

    // Perform individual validation checks with specific error messages
    if (!BuyAmount) {
      return res.json({
        message: "Buy amount is required",
        success: false,
        field: "BuyAmount",
      });
    }

    if (!DeliveryPrice) {
      return res.json({
        message: "Delivery price is required",
        success: false,
        field: "DeliveryPrice",
      });
    }

    if (!Direction) {
      return res.json({
        message: "Direction is required",
        success: false,
        field: "Direction",
      });
    }

    if (!Name) {
      return res.json({
        message: "Cryptocurrency name is required",
        success: false,
        field: "Name",
      });
    }

    if (!OpeningPrice) {
      return res.json({
        message: "Opening price is required",
        success: false,
        field: "OpeningPrice",
      });
    }

    if (!TermCode) {
      return res.json({
        message: "Term code is required",
        success: false,
        field: "TermCode",
      });
    }

    if (!Time) {
      return res.json({
        message: "Order time is required",
        success: false,
        field: "Time",
      });
    }

    if (!deliveryTime) {
      return res.json({
        message: "Delivery time is required",
        success: false,
        field: "deliveryTime",
      });
    }

    if (!openingTime) {
      return res.json({
        message: "Opening time is required",
        success: false,
        field: "openingTime",
      });
    }

    if (profit === undefined || profit === null) {
      return res.json({
        message: "Profit indicator is required",
        success: false,
        field: "profit",
      });
    }

    // Verify that openingTime + Time = deliveryTime
    const openingTimeDate = new Date(openingTime);
    const deliveryTimeDate = new Date(deliveryTime);

    // Calculate expected delivery time (openingTime + Time in seconds)
    const expectedDeliveryTime = new Date(
      openingTimeDate.getTime() + Time * 1000
    );

    // Allow small tolerance (1 second) for timing differences
    const timeDifference = Math.abs(
      deliveryTimeDate.getTime() - expectedDeliveryTime.getTime()
    );

    if (timeDifference > 1000) {
      // More than 1 second difference
      return res.json({
        message:
          "Invalid time values: Opening time + order time should equal delivery time",
        success: false,
        expected: expectedDeliveryTime,
        provided: deliveryTimeDate,
      });
    }

    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.json({
        message: "User not found",
        success: false,
      });
    }

    // Parse profit as a number to handle both positive and negative values
    const profitAmount = parseFloat(profit);

    // Update user's wallet balance based on profit value
    if (!isNaN(profitAmount)) {
      // If profit is positive, add to wallet balance
      // If profit is negative, subtract from wallet balance
      user.walletBalance += profitAmount;

      // Ensure wallet balance doesn't go negative (optional, remove if not needed)
      if (user.walletBalance < 0) {
        user.walletBalance = 0;
      }

      // Save the updated user
      await user.save();
    } else {
      return res.json({
        message: "Invalid profit value. Must be a valid number.",
        success: false,
        field: "profit",
      });
    }

    const order = await Order.create({
      cryptoCurrency: Name,
      termCode: TermCode,
      openingPrice: OpeningPrice,
      deliveryPrice: DeliveryPrice,
      direction: Direction,
      orderTime: Time,
      buyAmount: BuyAmount,
      deliveryTime: deliveryTime,
      openingTime: openingTime,
      profit: profit,
      user: user._id,
    });

    return res.json({
      message: "Order created successfully and wallet balance updated",
      success: true,
      data: order,
      updatedWalletBalance: user.walletBalance,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log("getting error in createOrder controller -->", error);
    }
    return res.status(500).json({
      msg: "Internal Server Error",
      success: false,
    });
  }
};

exports.getOpenOrders = async (req, res) => {
  try {
    const userId = req.user.sub;

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Get current time
    const currentTime = new Date();

    // First get total count for pagination metadata
    const totalCount = await Order.countDocuments({
      user: userId,
      deliveryTime: { $gt: currentTime },
    });

    // Find all orders for this user where deliveryTime is greater than current time
    const activeOrders = await Order.find({
      user: userId,
      deliveryTime: { $gt: currentTime },
    })
      .sort({ openingTime: -1 }) // Sort by opening time, newest first
      .skip(skip)
      .limit(limit);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    if (activeOrders.length === 0) {
      return res.status(200).json({
        message: "No active orders found",
        success: true,
        data: [],
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: totalPages,
          hasNextPage,
          hasPrevPage,
        },
      });
    }

    return res.status(200).json({
      message: "Active orders fetched successfully",
      success: true,
      count: activeOrders.length,
      data: activeOrders,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log("getting error in getOpenOrders controller -->", error);
    }
    return res.status(500).json({
      msg: "Internal Server Error",
      success: false,
    });
  }
};

exports.getClosedOrders = async (req, res) => {
  try {
    const userId = req.user.sub;

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Get current time
    const currentTime = new Date();

    // First get total count for pagination metadata
    const totalCount = await Order.countDocuments({
      user: userId,
      deliveryTime: { $lte: currentTime },
    });

    // Find all orders for this user where deliveryTime is less than or equal to current time
    const closedOrders = await Order.find({
      user: userId,
      deliveryTime: { $lte: currentTime },
    })
      .sort({ openingTime: -1 }) // Sort by opening time, newest first
      .skip(skip)
      .limit(limit);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    if (closedOrders.length === 0) {
      return res.status(200).json({
        message: "No closed orders found",
        success: true,
        data: [],
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: totalPages,
          hasNextPage,
          hasPrevPage,
        },
      });
    }

    return res.status(200).json({
      message: "Closed orders fetched successfully",
      success: true,
      count: closedOrders.length,
      data: closedOrders,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log("getting error in getClosedOrders controller -->", error);
    }
    return res.status(500).json({
      msg: "Internal Server Error",
      success: false,
    });
  }
};
