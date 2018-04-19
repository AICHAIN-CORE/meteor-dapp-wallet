/**
Template Controllers

@module Packages
*/


/**
Helper elements for ethereum dapps

@class [packages] ethereum:elements
@constructor
*/

ReactiveVar = function (initialValue, equalsFunc) {
  if (! (this instanceof ReactiveVar))
    // called without `new`
    return new ReactiveVar(initialValue, equalsFunc);

  this.curValue = initialValue;
  this.equalsFunc = equalsFunc;
  this.dep = new Tracker.Dependency;
};

ReactiveVar._isEqual = function (oldValue, newValue) {
  var a = oldValue, b = newValue;
  // Two values are "equal" here if they are `===` and are
  // number, boolean, string, undefined, or null.
  if (a !== b)
    return false;
  else
    return ((!a) || (typeof a === 'number') || (typeof a === 'boolean') ||
            (typeof a === 'string'));
};

/**
 * @summary Returns the current value of the ReactiveVar, establishing a reactive dependency.
 * @locus Client
 */
ReactiveVar.prototype.get = function () {
  if (Tracker.active)
    this.dep.depend();

  return this.curValue;
};

/**
 * @summary Sets the current value of the ReactiveVar, invalidating the Computations that called `get` if `newValue` is different from the old value.
 * @locus Client
 * @param {Any} newValue
 */
ReactiveVar.prototype.set = function (newValue) {
  var oldValue = this.curValue;

  if ((this.equalsFunc || ReactiveVar._isEqual)(oldValue, newValue))
    // value is same as last time
    return;

  this.curValue = newValue;
  this.dep.changed();
};

ReactiveVar.prototype.toString = function () {
  return 'ReactiveVar{' + this.get() + '}';
};

ReactiveVar.prototype._numListeners = function() {
  // Tests want to know.
  // Accesses a private field of Tracker.Dependency.
  var count = 0;
  for (var id in this.dep._dependentsById)
    count++;
  return count;
};


AITElements = {
    'Modal': {
        _current: new ReactiveVar(),
        /**
        Shows the modal template

        @method show
        @param {String|Object} template the template name or an object with `{template: 'name', data: {data: 'context'}}`
        @param {Object} options the options for the modal like `{closeable: true, closePath: '/dashboard'}`
        */
        'show': function(template, options) {
            options = options || {};

            if(_.isObject(template)) {
                options = _.extend(options, template);
                this._current.set(options);
            } else if(_.isString(template)) {
                options.template = template;
                this._current.set(options);
            }
        },
        /**
        Hide the modal template

        @method hide
        */
        'hide': function(){
            this._current.set(false);
        },
        /**
        Show the question modal

        @method question.show
        @param {Object} data the data for the modal question template
        @param {Object} options the options for the modal like `{closeable: true, closePath: '/dahsboard'}`
        */
        'question': function(data, options){
            AITElements.Modal.show({
                template: 'dapp_modal_questionAIT',
                data: data
            }, options);
        }
    }
};
