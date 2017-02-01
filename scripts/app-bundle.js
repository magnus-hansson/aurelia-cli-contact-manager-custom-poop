define('app',['exports', './web-api'], function (exports, _webApi) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.App = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var App = exports.App = function () {
    App.inject = function inject() {
      return [_webApi.WebAPI];
    };

    function App(api) {
      _classCallCheck(this, App);

      this.api = api;
    }

    App.prototype.configureRouter = function configureRouter(config, router) {
      config.title = 'Contacts';
      config.map([{ route: '', moduleId: 'no-selection', title: 'Select' }, { route: 'contacts/:id', moduleId: 'contact-detail', name: 'contacts' }]);

      this.router = router;
    };

    return App;
  }();
});
define('contact-detail',['exports', 'aurelia-event-aggregator', './web-api', './messages', './utility'], function (exports, _aureliaEventAggregator, _webApi, _messages, _utility) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ContactDetail = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var _class, _temp;

  var ContactDetail = exports.ContactDetail = (_temp = _class = function () {
    function ContactDetail(api, ea) {
      _classCallCheck(this, ContactDetail);

      this.api = api;
      this.ea = ea;
    }

    ContactDetail.prototype.activate = function activate(params, routeConfig) {
      var _this = this;

      this.routeConfig = routeConfig;

      return this.api.getContactDetails(params.id).then(function (contact) {
        _this.contact = contact;
        _this.routeConfig.navModel.setTitle(contact.firstName);
        _this.originalContact = JSON.parse(JSON.stringify(contact));
        _this.ea.publish(new _messages.ContactViewed(_this.contact));
      });
    };

    ContactDetail.prototype.save = function save() {
      var _this2 = this;

      this.api.saveContact(this.contact).then(function (contact) {
        _this2.contact = contact;
        _this2.routeConfig.navModel.setTitle(contact.firstName);
        _this2.originalContact = JSON.parse(JSON.stringify(contact));
        _this2.ea.publish(new _messages.ContactUpdated(_this2.contact));
      });
    };

    ContactDetail.prototype.toggled = function toggled() {};

    ContactDetail.prototype.canDeactivate = function canDeactivate() {
      if (!(0, _utility.areEqual)(this.originalContact, this.contact)) {
        var result = confirm('You have unsaved changes. Are you sure you wish to leave?');

        if (!result) {
          this.ea.publish(new _messages.ContactViewed(this.contact));
        }

        return result;
      }

      return true;
    };

    _createClass(ContactDetail, [{
      key: 'canSave',
      get: function get() {
        return this.contact.firstName && this.contact.lastName && !this.api.isRequesting;
      }
    }]);

    return ContactDetail;
  }(), _class.inject = [_webApi.WebAPI, _aureliaEventAggregator.EventAggregator], _temp);
});
define('contact-list',['exports', 'aurelia-event-aggregator', './web-api', './messages'], function (exports, _aureliaEventAggregator, _webApi, _messages) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ContactList = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var ContactList = exports.ContactList = (_temp = _class = function () {
    function ContactList(api, ea) {
      var _this = this;

      _classCallCheck(this, ContactList);

      this.api = api;
      this.contacts = [];

      ea.subscribe(_messages.ContactViewed, function (msg) {
        return _this.select(msg.contact);
      });
      ea.subscribe(_messages.ContactUpdated, function (msg) {
        var id = msg.contact.id;
        var found = _this.contacts.find(function (x) {
          return x.id === id;
        });
        Object.assign(found, msg.contact);
      });
    }

    ContactList.prototype.created = function created() {
      var _this2 = this;

      this.api.getContactList().then(function (contacts) {
        return _this2.contacts = contacts;
      });
    };

    ContactList.prototype.select = function select(contact) {
      this.selectedId = contact.id;
      return true;
    };

    return ContactList;
  }(), _class.inject = [_webApi.WebAPI, _aureliaEventAggregator.EventAggregator], _temp);
});
define('environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: true
  };
});
define('main',['exports', './environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  Promise.config({
    warnings: {
      wForgottenReturn: false
    }
  });

  function configure(aurelia) {
    aurelia.use.standardConfiguration().feature('resources');

    if (_environment2.default.debug) {
      aurelia.use.developmentLogging();
    }

    if (_environment2.default.testing) {
      aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(function () {
      return aurelia.setRoot();
    });
  }
});
define('messages',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var ContactUpdated = exports.ContactUpdated = function ContactUpdated(contact) {
    _classCallCheck(this, ContactUpdated);

    this.contact = contact;
  };

  var ContactViewed = exports.ContactViewed = function ContactViewed(contact) {
    _classCallCheck(this, ContactViewed);

    this.contact = contact;
  };
});
define('no-selection',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var NoSelection = exports.NoSelection = function NoSelection() {
    _classCallCheck(this, NoSelection);

    this.message = "Please Select a Contact.";
  };
});
define('utility',["exports"], function (exports) {
	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.areEqual = areEqual;
	function areEqual(obj1, obj2) {
		return Object.keys(obj1).every(function (key) {
			return obj2.hasOwnProperty(key) && obj1[key] === obj2[key];
		});
	};
});
define('web-api',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var latency = 200;
  var id = 0;

  function getId() {
    return ++id;
  }

  var contacts = [{
    id: getId(),
    firstName: 'John',
    lastName: 'Tolkien',
    email: 'tolkien@inklings.com',
    phoneNumber: '867-5309'
  }, {
    id: getId(),
    firstName: 'Clive',
    lastName: 'Lewis',
    email: 'lewis@inklings.com',
    phoneNumber: '867-5309'
  }, {
    id: getId(),
    firstName: 'Owen',
    lastName: 'Barfield',
    email: 'barfield@inklings.com',
    phoneNumber: '867-5309'
  }, {
    id: getId(),
    firstName: 'Charles',
    lastName: 'Williams',
    email: 'williams@inklings.com',
    phoneNumber: '867-5309'
  }, {
    id: getId(),
    firstName: 'Roger',
    lastName: 'Green',
    email: 'green@inklings.com',
    phoneNumber: '867-5309'
  }];

  var WebAPI = exports.WebAPI = function () {
    function WebAPI() {
      _classCallCheck(this, WebAPI);

      this.isRequesting = false;
    }

    WebAPI.prototype.getContactList = function getContactList() {
      var _this = this;

      this.isRequesting = true;
      return new Promise(function (resolve) {
        setTimeout(function () {
          var results = contacts.map(function (x) {
            return {
              id: x.id,
              firstName: x.firstName,
              lastName: x.lastName,
              email: x.email
            };
          });
          resolve(results);
          _this.isRequesting = false;
        }, latency);
      });
    };

    WebAPI.prototype.getContactDetails = function getContactDetails(id) {
      var _this2 = this;

      this.isRequesting = true;
      return new Promise(function (resolve) {
        setTimeout(function () {
          var found = contacts.filter(function (x) {
            return x.id == id;
          })[0];
          resolve(JSON.parse(JSON.stringify(found)));
          _this2.isRequesting = false;
        }, latency);
      });
    };

    WebAPI.prototype.saveContact = function saveContact(contact) {
      var _this3 = this;

      this.isRequesting = true;
      return new Promise(function (resolve) {
        setTimeout(function () {
          var instance = JSON.parse(JSON.stringify(contact));
          var found = contacts.filter(function (x) {
            return x.id == contact.id;
          })[0];

          if (found) {
            var index = contacts.indexOf(found);
            contacts[index] = instance;
          } else {
            instance.id = getId();
            contacts.push(instance);
          }

          _this3.isRequesting = false;
          resolve(instance);
        }, latency);
      });
    };

    return WebAPI;
  }();
});
define('resources/index',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {
    config.globalResources(['./elements/loading-indicator', './elements/mh-pop']);
  }
});
define('resources/elements/loading-indicator',['exports', 'nprogress', 'aurelia-framework'], function (exports, _nprogress, _aureliaFramework) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.LoadingIndicator = undefined;

  var nprogress = _interopRequireWildcard(_nprogress);

  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};

      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
        }
      }

      newObj.default = obj;
      return newObj;
    }
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var LoadingIndicator = exports.LoadingIndicator = (0, _aureliaFramework.decorators)((0, _aureliaFramework.noView)(['nprogress/nprogress.css']), (0, _aureliaFramework.bindable)({ name: 'loading', defaultValue: false })).on(function () {
    function _class() {
      _classCallCheck(this, _class);
    }

    _class.prototype.loadingChanged = function loadingChanged(newValue) {
      if (newValue) {
        nprogress.start();
      } else {
        nprogress.done();
      }
    };

    return _class;
  }());
});
define('resources/elements/mh-pop',["exports", "aurelia-framework", "./utils/tooltip-service", "./utils/bootstrap-options", "velocity-animate"], function (exports, _aureliaFramework, _tooltipService, _bootstrapOptions, _velocityAnimate) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.MhPopoverCustomAttribute = undefined;

    var _velocityAnimate2 = _interopRequireDefault(_velocityAnimate);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _initDefineProp(target, property, descriptor, context) {
        if (!descriptor) return;
        Object.defineProperty(target, property, {
            enumerable: descriptor.enumerable,
            configurable: descriptor.configurable,
            writable: descriptor.writable,
            value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
        });
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
        var desc = {};
        Object['ke' + 'ys'](descriptor).forEach(function (key) {
            desc[key] = descriptor[key];
        });
        desc.enumerable = !!desc.enumerable;
        desc.configurable = !!desc.configurable;

        if ('value' in desc || desc.initializer) {
            desc.writable = true;
        }

        desc = decorators.slice().reverse().reduce(function (desc, decorator) {
            return decorator(target, property, desc) || desc;
        }, desc);

        if (context && desc.initializer !== void 0) {
            desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
            desc.initializer = undefined;
        }

        if (desc.initializer === void 0) {
            Object['define' + 'Property'](target, property, desc);
            desc = null;
        }

        return desc;
    }

    function _initializerWarningHelper(descriptor, context) {
        throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
    }

    var _dec, _dec2, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8;

    var MhPopoverCustomAttribute = exports.MhPopoverCustomAttribute = (_dec = (0, _aureliaFramework.inject)(Element, _tooltipService.TooltipService), _dec2 = (0, _aureliaFramework.bindable)({ defaultBindingMode: _aureliaFramework.bindingMode.twoWay }), _dec(_class = (_class2 = function () {
        function MhPopoverCustomAttribute(element, tooltipService) {
            var _this = this;

            _classCallCheck(this, MhPopoverCustomAttribute);

            _initDefineProp(this, "title", _descriptor, this);

            _initDefineProp(this, "body", _descriptor2, this);

            _initDefineProp(this, "position", _descriptor3, this);

            _initDefineProp(this, "disabled", _descriptor4, this);

            _initDefineProp(this, "isOpen", _descriptor5, this);

            _initDefineProp(this, "trigger", _descriptor6, this);

            _initDefineProp(this, "customPopover", _descriptor7, this);

            _initDefineProp(this, "onToggle", _descriptor8, this);

            this.triggers = [];
            this.validPositions = ['top', 'bottom', 'left', 'right'];
            this.valuesChanged = false;
            this.visible = false;

            this.element = element;
            this.tooltipService = tooltipService;

            this.listeners = {
                in: function _in() {
                    return _this.handleShow();
                },
                out: function out() {
                    return _this.handleHide();
                },
                click: function click() {
                    _this.visible ? _this.handleHide() : _this.handleShow();
                },
                outside: function outside(event) {
                    return _this.handleOutside(event);
                }
            };
        }

        MhPopoverCustomAttribute.prototype.bind = function bind() {
            if (!this.validPositions.includes(this.position)) {
                this.position = 'top';
            }

            this.triggers = this.trigger.split(' ');
        };

        MhPopoverCustomAttribute.prototype.attached = function attached() {
            this.tooltipService.setTriggers(this.element, this.triggers, this.listeners);

            if (this.customPopover) {
                this.customPopover.style.display = 'none';
            }

            this.attached = true;
            if (this.isOpen) {
                this.handleShow();
            }
        };

        MhPopoverCustomAttribute.prototype.detached = function detached() {
            this.tooltipService.removeTriggers(this.element, this.triggers, this.listeners);

            if (this.popover) {
                document.body.removeChild(this.popover);
            }

            if (this.tether) {
                this.tether.destroy();
            }
        };

        MhPopoverCustomAttribute.prototype.isOpenChanged = function isOpenChanged() {
            if (!this.attached) {
                return;
            }

            if (this.isOpen) {
                this.handleShow();
            } else {
                this.handleHide();
            }
        };

        MhPopoverCustomAttribute.prototype.titleChanged = function titleChanged() {
            this.valuesChanged = true;

            if (this.titleElement) {
                this.titleElement.innerHTML = this.title;
            }
        };

        MhPopoverCustomAttribute.prototype.bodyChanged = function bodyChanged() {
            this.valuesChanged = true;

            if (this.bodyElement) {
                this.bodyElement.innerHTML = this.body;
            }
        };

        MhPopoverCustomAttribute.prototype.positionChanged = function positionChanged(newValue, oldValue) {
            if (!this.validPositions.includes(newValue)) {
                this.position = oldValue;
                return;
            }
            this.oldPosition = oldValue;

            this.valuesChanged = true;
        };

        MhPopoverCustomAttribute.prototype.triggerChanged = function triggerChanged(newValue, oldValue) {
            this.tooltipService.removeTriggers(this.element, this.triggers, this.listeners);

            this.triggers = this.trigger.split(' ');
            this.tooltipService.setTriggers(this.element, this.triggers, this.listeners);
        };

        MhPopoverCustomAttribute.prototype.handleShow = function handleShow() {
            var _this2 = this;

            if (this.visible || this.disabled) {
                return;
            }

            if (!this.popover || this.valuesChanged) {
                this.createPopover();
                this.valuesChanged = false;
            }

            this.popover.style.display = 'block';
            this.tether.position();

            (0, _velocityAnimate2.default)(this.popover, 'stop').then(function () {
                (0, _velocityAnimate2.default)(_this2.popover, 'fadeIn').then(function () {
                    _this2.popover.classList.add('in');

                    if (typeof _this2.onToggle === 'function') {
                        _this2.onToggle({ open: true });
                    }
                });
            });

            this.visible = true;
            this.isOpen = true;
        };

        MhPopoverCustomAttribute.prototype.handleHide = function handleHide() {
            var _this3 = this;

            if (!this.visible) {
                return;
            }

            (0, _velocityAnimate2.default)(this.popover, 'stop').then(function () {
                (0, _velocityAnimate2.default)(_this3.popover, 'fadeOut').then(function () {
                    _this3.popover.classList.remove('in');

                    if (typeof _this3.onToggle === 'function') {
                        _this3.onToggle({ open: false });
                    }
                });
            });

            this.visible = false;
            this.isOpen = false;
        };

        MhPopoverCustomAttribute.prototype.handleOutside = function handleOutside(event) {
            if (!this.visible) {
                return;
            }

            if (this.element !== event.target && !this.popover.contains(event.target)) {
                this.handleHide();
            }
        };

        MhPopoverCustomAttribute.prototype.getPositionClass = function getPositionClass(position) {
            return (_bootstrapOptions.bootstrapOptions.version === 4 ? 'popover-' : '') + position;
        };

        MhPopoverCustomAttribute.prototype.createPopover = function createPopover() {
            var arrow = document.createElement('div');
            arrow.classList.add('arrow');

            if (this.customPopover) {
                this.popover = this.customPopover;

                this.popover.classList.remove(this.getPositionClass(this.oldPosition));

                this.popover.classList.add('popover');
                this.popover.classList.add(this.getPositionClass(this.position));

                if (!this.popover.querySelector('.arrow')) {
                    this.popover.appendChild(arrow);
                }
            } else {
                if (this.popover) {
                    document.body.removeChild(this.popover);
                }

                this.popover = document.createElement('div');
                this.popover.classList.add('popover');
                this.popover.classList.add(this.getPositionClass(this.position));

                this.popover.appendChild(arrow);

                if (this.title) {
                    this.titleElement = document.createElement('h3');
                    this.titleElement.classList.add('popover-title');
                    this.titleElement.innerHTML = this.title;
                    this.popover.appendChild(this.titleElement);
                }

                var content = document.createElement('div');
                content.classList.add('popover-content');
                this.bodyElement = document.createElement('p');
                this.bodyElement.innerHTML = this.body;
                content.appendChild(this.bodyElement);
                this.popover.appendChild(content);

                document.body.appendChild(this.popover);
            }

            if (this.tether) {
                this.tether.destroy();
            }

            this.tether = this.tooltipService.createAttachment(this.element, this.popover, this.position);
        };

        return MhPopoverCustomAttribute;
    }(), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "title", [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "body", [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "position", [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: function initializer() {
            return 'top';
        }
    }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "disabled", [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: function initializer() {
            return false;
        }
    }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "isOpen", [_dec2], {
        enumerable: true,
        initializer: function initializer() {
            return false;
        }
    }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "trigger", [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: function initializer() {
            return 'mouseover';
        }
    }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "customPopover", [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "onToggle", [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    })), _class2)) || _class);
});
define('resources/elements/utils/bootstrap-options',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var bootstrapOptions = exports.bootstrapOptions = {
    version: 3
  };
});
define('resources/elements/utils/tooltip-service',['exports', 'tether'], function (exports, _tether) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.TooltipService = undefined;

    var _tether2 = _interopRequireDefault(_tether);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var TooltipService = exports.TooltipService = function () {
        function TooltipService() {
            _classCallCheck(this, TooltipService);
        }

        TooltipService.prototype.createAttachment = function createAttachment(target, element, position) {
            var attachment = void 0;
            var targetAttachment = void 0;

            if (position === 'top') {
                attachment = 'bottom center';
                targetAttachment = "top center";
            } else if (position === 'bottom') {
                attachment = 'top center';
                targetAttachment = "bottom center";
            } else if (position === 'left') {
                attachment = 'center right';
                targetAttachment = "center left";
            } else {
                attachment = 'center left';
                targetAttachment = "center right";
            }

            return new _tether2.default({
                element: element,
                target: target,
                attachment: attachment,
                targetAttachment: targetAttachment
            });
        };

        TooltipService.prototype.setTriggers = function setTriggers(element, triggers, listeners) {
            if (!triggers.includes('none')) {
                if (triggers.includes('mouseover')) {
                    element.addEventListener('mouseover', listeners.in);
                    element.addEventListener('mouseleave', listeners.out);
                }

                if (triggers.includes('focus')) {
                    element.addEventListener('focus', listeners.in);
                    element.addEventListener('blur', listeners.out);
                }

                if (triggers.includes('click')) {
                    element.addEventListener('click', listeners.click);
                } else if (triggers.includes('outsideClick')) {
                    element.addEventListener('click', listeners.in);
                    document.addEventListener('click', listeners.outside);
                }
            }
        };

        TooltipService.prototype.removeTriggers = function removeTriggers(element, triggers, listeners) {
            if (!triggers.includes('none')) {
                if (triggers.includes('mouseover')) {
                    element.removeEventListener('mouseover', listeners.in);
                    element.removeEventListener('mouseleave', listeners.out);
                }

                if (triggers.includes('focus')) {
                    element.removeEventListener('focus', listeners.in);
                    element.removeEventListener('blur', listeners.out);
                }

                if (triggers.includes('click')) {
                    element.removeEventListener('click', listeners.click);
                } else if (triggers.includes('outsideClick')) {
                    element.removeEventListener('click', listeners.in);
                    document.removeEventListener('click', listeners.outside);
                }
            }
        };

        return TooltipService;
    }();
});
define('text!app.html', ['module'], function(module) { module.exports = "<template><require from=\"bootstrap/css/bootstrap.css\"></require><require from=\"./styles.css\"></require><require from=\"./contact-list\"></require><nav class=\"navbar navbar-default navbar-fixed-top\" role=\"navigation\"><div class=\"navbar-header\"><a class=\"navbar-brand\" href=\"#\"><i class=\"fa fa-user\"></i> <span>Contacts</span></a></div></nav><loading-indicator loading.bind=\"router.isNavigating || api.isRequesting\"></loading-indicator><div class=\"container\"><div class=\"row\"><contact-list class=\"col-md-4\"></contact-list><router-view class=\"col-md-8\"></router-view></div></div></template>"; });
define('text!styles.css', ['module'], function(module) { module.exports = "body { padding-top: 70px; }\n\nsection {\n  margin: 0 20px;\n}\n\na:focus {\n  outline: none;\n}\n\n.navbar-nav li.loader {\n    margin: 12px 24px 0 6px;\n}\n\n.no-selection {\n  margin: 20px;\n}\n\n.contact-list {\n  overflow-y: auto;\n  border: 1px solid #ddd;\n  padding: 10px;\n}\n\n.panel {\n  margin: 20px;\n}\n\n.button-bar {\n  right: 0;\n  left: 0;\n  bottom: 0;\n  border-top: 1px solid #ddd;\n  background: white;\n}\n\n.button-bar > button {\n  float: right;\n  margin: 20px;\n}\n\nli.list-group-item {\n  list-style: none;\n}\n\nli.list-group-item > a {\n  text-decoration: none;\n}\n\nli.list-group-item.active > a {\n  color: white;\n}\n"; });
define('text!contact-detail.html', ['module'], function(module) { module.exports = "<template><div class=\"panel panel-primary\"><div class=\"panel-heading\"><h3 class=\"panel-title\">Profile</h3></div><div class=\"panel-body\"><form role=\"form\" class=\"form-horizontal\"><div class=\"form-group\"><label class=\"col-sm-2 control-label\">First Name</label><div class=\"col-sm-10\"><input type=\"text\" placeholder=\"first name\" class=\"form-control\" value.bind=\"contact.firstName\"></div></div><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Last Name</label><div class=\"col-sm-10\"><input type=\"text\" placeholder=\"last name\" class=\"form-control\" value.bind=\"contact.lastName\"></div></div><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Email</label><div class=\"col-sm-10\"><input type=\"text\" placeholder=\"email\" class=\"form-control\" value.bind=\"contact.email\"></div></div><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Phone Number</label><div class=\"col-sm-10\"><input type=\"text\" placeholder=\"phone number\" class=\"form-control\" value.bind=\"contact.phoneNumber\"></div></div></form></div></div><div class=\"button-bar\"><button class=\"btn btn-success\" click.delegate=\"save()\" disabled.bind=\"!canSave\">Save</button> <button class=\"btn btn-default\" mh-popover=\"title:My Title <i class='fa fa-heart'></i>;body:<a href='#/popover'>Awesome</a> <strong>Content</strong>;position.bind: 'left';on-toggle.call:toggled(open)\">Basic Popover</button></div></template>"; });
define('text!contact-list.html', ['module'], function(module) { module.exports = "<template><div class=\"contact-list\"><ul class=\"list-group\"><li repeat.for=\"contact of contacts\" class=\"list-group-item ${contact.id === $parent.selectedId ? 'active' : ''}\"><a route-href=\"route: contacts; params.bind: {id:contact.id}\" click.delegate=\"$parent.select(contact)\"><h4 class=\"list-group-item-heading\">${contact.firstName} ${contact.lastName}</h4><p class=\"list-group-item-text\">${contact.email}</p></a></li></ul></div></template>"; });
define('text!no-selection.html', ['module'], function(module) { module.exports = "<template><div class=\"no-selection text-center\"><h2>${message}</h2></div></template>"; });
//# sourceMappingURL=app-bundle.js.map