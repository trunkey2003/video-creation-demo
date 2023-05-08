const exampleUser = {
    _id: "5e8f8f8f8f8f8f8f8f8f8f8f",
    userName: "user",
    avatar: "https://trunkey2003.github.io/general-img/default-profile-pic.jpg",
    email: "user@user.com",
    fullName: "user",
    phone: "0912345678",
    address: "number street, ward, city, country",
    type: 0,
};

const exampleProduct = {
    _id: "5e8f8f8f8f8f8f8f8f8f8f8f",
    name: "product",
    price: 100000,
    description: "product",
    image: "https://trunkey2003.github.io/general-img/no-image.jpg",
    category: "other",
    quantity: 0,
}

const server = [];
if (process.env.DEV_ENDPOINT) server.push({ url: process.env.DEV_ENDPOINT, description: 'development' });
if (process.env.PROD_ENDPOINT) server.push({ url: process.env.PROD_ENDPOINT, description: 'production' });

const swaggerDocumentation = {
    openapi: "3.0.0",
    info: {
        title: 'API Documentation',
        version: '1.0.0',
        description: 'API Documentation',
    },
    servers: server,
    components: {
        schemas: {
            User: {
                type: 'object',
                properties: {
                    _id: { type: 'string', format: 'objectid' },
                    userName: { type: 'string', minlength: 3, maxlength: 20 },
                    avatar: { type: 'string', default: "https://trunkey2003.github.io/general-img/default-profile-pic.jpg" },
                    email: { type: 'string', required: true },
                    fullName: { type: 'string', minlength: 3, maxlength: 50 },
                    phone: { type: 'string' },
                    address: { type: 'string' },
                    type: { type: 'number', default: 0 }, // 0: user, 1: admin
                }
            },
            Product: {
                type: 'object',
                properties: {
                    _id: { type: 'string', format: 'objectid' },
                    name: { type: 'string', minlength: 3, maxlength: 50 },
                    price: { type: 'number', required: true },
                    description: { type: 'string', minlength: 3, maxlength: 500 },
                    image: { type: 'string', required: true, default: "https://trunkey2003.github.io/general-img/no-image.jpg" },
                    category: { type: 'string', required: true, default: 'other' },
                    quantity: { type: 'number', required: true, default: 0 },
                }
            }
        }
    },
    paths: {
        "/api/v1/user": {
            get: {
                tags: ["users"],
                description: "List of the users, requires admin role",
                responses: {
                    200: {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    type: 'array',
                                    items: {
                                        $ref: "#/components/schemas/User"
                                    }
                                },
                                example: [
                                    exampleUser
                                ]
                            }
                        }
                    },
                    403: {
                        description: "Forbidden",
                        content: {}
                    },
                    500: {
                        description: "Internal Server Error",
                        content: {}
                    }
                }
            }
        },
        "/api/v1/user/me": {
            get: {
                tags: ["users"],
                description: "Get current user by cookie",
                responses: {
                    200: {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/User",
                                },
                                example: exampleUser
                            }
                        }
                    },
                    401: {
                        description: "Unauthorized",
                        content: {}
                    },
                    500: {
                        description: "Internal Server Error",
                        content: {}
                    }
                }
            }
        },
        "/api/v1/user/sign-in": {
            post: {
                tags: ["users"],
                description: "Sign in",
                requestBody: {
                    description: "Sign in",
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: 'object',
                                properties: {
                                    userName: { type: 'string', minlength: 3, maxlength: 20 },
                                    password: { type: 'string', minlength: 3, maxlength: 20 },
                                    rememberMe: { type: 'boolean', default: false },
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/User",
                                },
                                example: exampleUser
                            }
                        },
                        headers: {
                            "Set-Cookie": {
                                description: "JWT Token",
                                schema: {
                                    type: 'string',
                                    example: "token=token; Path=/;max-age=3600000*24*7; HttpOnly"
                                }
                            }
                        }
                    },
                    401: {
                        description: "Unauthorized",
                        content: {}
                    },
                    503: {
                        description: "Internal Server Error",
                        content: {}
                    }
                }
            }
        },
        "/api/v1/user/sign-up": {
            post: {
                tags: ["users"],
                description: "Sign up",
                requestBody: {
                    description: "New user",
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: 'object',
                                properties: {
                                    userName: { type: 'string', minlength: 3, maxlength: 20, required: true },
                                    email: { type: 'string', minlength: 3, maxlength: 50, required: true },
                                    phone: { type: 'string', minlength: 3, maxlength: 20, required: true },
                                    password: { type: 'string', minlength: 3, maxlength: 20, required: true },
                                    autoSignIn: { type: 'boolean', default: false }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/User",
                                },
                                example: exampleUser
                            }
                        },
                        headers: {
                            "Set-Cookie": {
                                description: "JWT Token",
                                schema: {
                                    type: 'string',
                                    example: "token=token; Path=/;max-age=3600000*24*7; HttpOnly"
                                }
                            }
                        }
                    },
                    409: {
                        description: "Username or email already exists",
                        content: {}
                    },
                    500: {
                        description: "Internal Server Error",
                        content: {}
                    }
                }
            }
        },
        "/api/v1/user/sign-out": {
            delete: {
                tags: ["users"],
                description: "Sign out",
                responses: {
                    205: {
                        description: "Success",
                        headers: {
                            "Set-Cookie": {
                                description: "JWT Token",
                                schema: {
                                    type: 'string',
                                    example: "token=goodbye; Path=/;max-age=0; HttpOnly"
                                }
                            }
                        }
                    },
                    500: {
                        description: "Internal Server Error",
                        content: {}
                    }
                }
            }
        },
        "/api/v1/product": {
            get: {
                tags: ["products"],
                description: "List of the products",
                responses: {
                    200: {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    type: 'array',
                                    items: {
                                        $ref: "#/components/schemas/Product"
                                    }
                                },
                                example: [
                                    exampleProduct
                                ]
                            }
                        }
                    },
                    500: {
                        description: "Internal Server Error",
                        content: {}
                    }
                }
            },
            post: {
                tags: ["products"],
                description: "Add product",
                requestBody: {
                    description: "New product",
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', minlength: 3, maxlength: 50 },
                                    price: { type: 'number', required: true },
                                    description: { type: 'string', minlength: 3, maxlength: 500 },
                                    image: { type: 'string', required: true, default: "https://trunkey2003.github.io/general-img/no-image.jpg" },
                                    category: { type: 'string', required: true, default: 'other' },
                                    quantity: { type: 'number', required: true, default: 0 },
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    type: 'object',
                                    $ref: "#/components/schemas/Product"
                                },
                                example: [
                                    exampleProduct
                                ]
                            }
                        }
                    },
                    500: {
                        description: "Internal Server Error",
                        content: {}
                    }
                }
            }
        },
    }
}

module.exports = swaggerDocumentation;