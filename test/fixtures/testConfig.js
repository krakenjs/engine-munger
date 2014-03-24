module.exports = {
    'none-js': {
        config: {
            'views': 'test/fixtures/.build/',
            'view engine': 'js'
        }
    },
    'onlySpcl-js': {
        'config': {
            'views': 'test/fixtures/.build/',
            'view engine': 'js',
            'specialization': {
                'spcl/jekyll': [
                    {
                        'is': 'spcl/hyde',
                        'when': {
                            'whoAmI': 'badGuy'
                        }
                    }
                ]
            }
        },
        'context': {
            'whoAmI': 'badGuy',
            views: 'test/fixtures/.build'
        }
    },
    'onlyIntl-js': {
        'config': {
            'views': 'test/fixtures/.build/',
            'view engine': 'js',
            'i18n': {
                'fallback': 'en-US',
                'contentPath': 'test/fixtures/properties'
            }
        },
        'context': {
            views: 'test/fixtures/.build',
            context: {
                locality: 'es_US'
            }
        }
    },
    'spclAndIntl-js': {
        'config': {
            'views': 'test/fixtures/.build/',
            'view engine': 'js',
            'i18n': {
                'fallback': 'en-US',
                'contentPath': 'test/fixtures/properties'
            },
            specialization: {
                'spcl/jekyll': [
                    {
                        is: 'spcl/hyde',
                        when: {
                            'whoAmI': 'badGuy'
                        }
                    }
                ]

            }
        },
        'context': {
            views: 'test/fixtures/.build',
            whoAmI: 'badGuy',
            context: {
                locality: 'es_US'
            }
        }
    },
    'none-dust': {
        config: {
            'views': 'test/fixtures/templates'
        }
    },
    'onlySpcl-dust': {
        'config': {
            'views': 'test/fixtures/templates',
            'view engine': 'dust',
            'specialization': {
                'spcl/jekyll': [
                    {
                        'is': 'spcl/hyde',
                        'when': {
                            'whoAmI': 'badGuy'
                        }
                    }
                ]
            }
        },
        'context': {
            'whoAmI': 'badGuy',
            'views': 'test/fixtures/templates'
        }
    },
    'onlyIntl-dust': {
        'config': {
            'views': 'test/fixtures/templates',
            'view engine': 'dust',
            'i18n': {
                'fallback': 'en-US',
                'contentPath': 'test/fixtures/properties'
            }
        },
        'context': {
            views: 'test/fixtures/templates',
            context: {
                locality: 'es_US'
            }
        }
    },
    'spclAndIntl-dust': {
        'config': {
            'i18n': {
                'fallback': 'en-US',
                'contentPath': 'test/fixtures/properties'
            },
            specialization: {
                'spcl/jekyll': [
                    {
                        is: 'spcl/hyde',
                        when: {
                            'whoAmI': 'badGuy'
                        }
                    }
                ]

            },
            'views' : 'test/fixtures/templates',
            'view engine': 'dust'
        },
        'context': {
           'views' : 'test/fixtures/templates',
            whoAmI: 'badGuy',
            context: {
                locality: 'es_US'
            }
        }

    }
};