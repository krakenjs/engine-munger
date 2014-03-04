module.exports = {
    'none': {
        config: {
            i18n: null,
            specialization: null
        }
    },
    'onlySpcl': {
        'config': {
            'i18n': null,
            'specialization': {
                'spcl/jekyll': [
                    {
                        'template': 'spcl/hyde',
                        'rules': {
                            'whoAmI': 'badGuy'
                        }
                    }
                ]

            }
        },
        'context': {
            'whoAmI': 'badGuy',
            'get' : function(name) {
                if(name === 'context'){
                    return {
                        locality: 'es_US'
                    }
                } else {
                    return module.exports.onlySpcl.context._specialization;
                }
            }
        }
    },
    'onlyIntl': {
        'config': {
            'i18n': {
                'fallback': 'en-US',
                'contentPath': 'test/fixtures/properties'
            }
        },
        'context': {
            'get': function() {
                return {
                    locality: 'es_US'
                };
            }
        }
    },
    'spclAndIntl': {
        'config': {
            js: {
                'i18n': {
                    'fallback': 'en-US',
                    'contentPath': 'test/fixtures/properties'
                },
                specialization: {
                    'spcl/jekyll': [
                        {
                            template: 'spcl/hyde',
                            rules: {
                                'whoAmI': 'badGuy'
                            }
                        }
                    ]

                }
            },
            dust: {
                'i18n': {
                    'fallback': 'en-US',
                    'contentPath': 'test/fixtures/properties'
                },
                specialization: {
                    'jekyll': [
                        {
                            template: 'hyde',
                            rules: {
                                'whoAmI': 'badGuy'
                            }
                        }
                    ]

                }
            }

        },
        context: {
            whoAmI: 'badGuy',
            get: function(name) {
                if(name === 'context'){
                    return {
                        locality: 'es_US'
                    }
                } else {
                    return module.exports.spclAndIntl.context._specialization;
                }
            }
        }
    }
}