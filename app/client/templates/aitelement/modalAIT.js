/**
Template Controllers

@module Templates
*/


/**
The modal placeholder template.

@class [template] dapp_modalPlaceholderAIT
@constructor
*/

Template['dapp_modalPlaceholderAIT'].onCreated(function(){
});


Template['dapp_modalPlaceholderAIT'].helpers({
    /**
    The modal template, set manualy

    @method (modalTemplate)
    */
    'modalTemplate': function(){
        return (AITElements.Modal._current.get())
            ? 'dapp_modalAIT' : false;
    },
    /**
    The modal templates data, set manualy

    @method (modalData)
    */
    'modalData': function(){
        return AITElements.Modal._current.get();
    }
});



/**
The modal wrapper template.
If you pass "closePath" in the data context, it will use this path, when the modal overlay is clicked.


@class [template] dapp_modalAIT
@constructor
*/


/**
Look the scrolling of the body

@method rendered
*/
Template['dapp_modalAIT'].onCreated(function(){
    $('body').addClass('disable-scroll blur');
});


/**
Remove look of scrolling from the body

@method rendered
*/
Template['dapp_modalAIT'].onDestroyed(function(){
    $('body').removeClass('disable-scroll blur');
});


Template['dapp_modalAIT'].events({
    /**
    Hide the modal on click. If the data context has the property "closePath",
    it will route to this one instead of going back in the browser history.

    If the "closeable" is FALSE, it won't close the modal, when clicking the overlay.

    @event click .dapp-modal-overlay
    */
    'click .dapp-modal-overlay': function(e, template){
        // hide the modal
        if($(e.target).hasClass('dapp-modal-overlay') && template.data.closeable !== false) {

            if(template.data.closePath && typeof Router !== 'undefined') {
                if(typeof Router !== 'undefined')
                    Router.go(template.data.closePath);
                if(typeof FlowRouter !== 'undefined')
                    FlowRouter.go(template.data.closePath);
            } else
                AITElements.Modal.hide();
        }
    }
});