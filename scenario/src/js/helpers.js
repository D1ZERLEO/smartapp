// js/helpers.js

function getRequest(context) {
    if (context && context.request)
        return context.request.rawRequest;
    return {};
}

function getItems(request) {
    if (request &&
        request.payload &&
        request.payload.meta &&
        request.payload.meta.current_app &&
        request.payload.meta.current_app.state &&
        request.payload.meta.current_app.state.item_selector) {
        return request.payload.meta.current_app.state.item_selector.items;
    }
    return null;
}

function getSelectedItem(request) {
    if (request &&
        request.payload &&
        request.payload.meta &&
        request.payload.meta.current_app &&
        request.payload.meta.current_app.state) {
        return request.payload.selected_item;
    }
    return null;
}

function getFoodIdBySelected(request) {
    var items = getItems(request);
    var selected = getSelectedItem(request);
    
    if (selected && items && items[selected.index]) {
        return items[selected.index].id;
    }
    return null;
}