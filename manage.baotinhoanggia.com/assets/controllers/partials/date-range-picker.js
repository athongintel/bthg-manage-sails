const DateRangePickerController = function ($scope, $element) {
    "use strict";
    
    const ctrl = this;
    
    
    ctrl.$onInit = function () {
        ctrl.picker = $element.find('.date-range-select').dateRangePicker({
            time: {
                enabled: true
            }
        });
        ctrl.picker.bind('datepicker-apply',function(event, obj){
            ctrl.onDateChanged({selectedDateRange: obj});
        });
    };
    
    ctrl.$onChanges = function (objs) {
        if (ctrl.picker && objs['selectedDateRange'] && !objs['selectedDateRange'].curentValue){
            $element.find('.date-range-select').data('dateRangePicker').clear();
        }
    };
};

app.component('dateRangePicker', {
    templateUrl: 'partials/date-range-picker',
    controller: DateRangePickerController,
    bindings: {
        global: '<',
        selectedDateRange: '<',
        onDateChanged: '&'
    }
});
