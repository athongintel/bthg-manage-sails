const DateRangePickerController = function ($scope, $element) {
    "use strict";
    
    const ctrl = this;
    
    
    ctrl.$onInit = function () {
        let options = {
            format: 'DD-MM-YYYY',
            time: {
                enabled: true
            }
        };
        if (ctrl.single){
            options.singleDate = true;
            options.autoClose = true;
        }
        ctrl.picker = $element.find('.date-range-select').dateRangePicker(options);
        ctrl.picker.bind('datepicker-apply',function(event, obj){
            ctrl.onDateChanged({selectedDateRange: obj});
        });
        ctrl.picker.bind('datepicker-first-date-selected', function(event, obj){
            if (ctrl.single) ctrl.onDateChanged({selectedDateRange: obj});
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
        single: '<',
        selectedDate: '<',
        selectedDateRange: '<',
        onDateChanged: '&'
    }
});
