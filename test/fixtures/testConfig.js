module.exports = {
    'none': {
        config: {
            i18n: null,
            specialization: null,
            views: 'test/fixtures/templates'
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

            },
            views: 'test/fixtures/templates'
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
            },
            views: 'test/fixtures/templates'
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

                },
                views: 'test/fixtures/templates'
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