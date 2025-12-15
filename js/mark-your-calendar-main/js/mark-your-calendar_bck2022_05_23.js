/*!
 * Author:  Mark Allan B. Meriales
 * Name:    Mark Your Calendar v0.0.1
 * License: MIT License
 */

(function($) {
    // https://stackoverflow.com/questions/563406/add-days-to-javascript-date
    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }

    $.fn.markyourcalendar = function(opts) {
        var prevHtml = `
            <div id="myc-prev-week">
                <
            </div>
        `;
        var nextHtml = `<div id="myc-next-week">></div>`;
        var defaults = {
            availability: [[], [], [], [], [], [], []], // listahan ng mga oras na pwedeng piliin
            
            // Garcia
            dayHM: undefined,
            
            isMultiple: false,
            months: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
            prevHtml: prevHtml,
            nextHtml: nextHtml,
            selectedDates: [],
            startDate: new Date(),
            weekdays: ['sun', 'mon', 'tue', 'wed', 'thurs', 'fri', 'sat'],
        };
        var settings = $.extend({}, defaults, opts);
        var html = ``;

        var onClick = settings.onClick;
        var onClickNavigator = settings.onClickNavigator;
        var instance = this;

        // kuhanin ang buwan
        this.getMonthName = function(idx) {
            return settings.months[idx];
        };

        var formatDate = function(d) {
            var date = '' + d.getDate();
            var month = '' + (d.getMonth() + 1);
            var year = d.getFullYear();
            if (date.length < 2) {
                date = '0' + date;
            }
            if (month.length < 2) {
                month = '0' + month;
            }
            return year + '-' + month + '-' + date;
        };

        // Eto ang controller para lumipat ng linggo
        // Controller to change 
        this.getNavControl = function() {
            var previousWeekHtml = `<div id="myc-prev-week-container">` + settings.prevHtml + `</div>`;
            var nextWeekHtml = `<div id="myc-prev-week-container">` + settings.nextHtml + `</div>`;
            var monthYearHtml = `
                <div id="myc-current-month-year-container">
                    ` + this.getMonthName(settings.startDate.getMonth()) + ' ' + settings.startDate.getFullYear() + `
                </div>
            `;

            alert("settings.startDate: " + settings.startDate );




            var navHtml = `
                <div id="myc-nav-container">
                    ` + previousWeekHtml + `
                    ` + monthYearHtml + `
                    ` + nextWeekHtml + `
                    <div style="clear:both;"></div>
                </div>
            `;
            return navHtml;
        };

        // kuhanin at ipakita ang mga araw
        this.getDatesHeader = function() {
            var tmp = ``;
            for (i = 0; i < 7; i++) {
                var d = settings.startDate.addDays(i);
                
                /* Garcia: +monthname in day header*/
                var mname = " " + this.getMonthName(d.getMonth());
                
                
                tmp += `
                    <div class="myc-date-header" id="myc-date-header-` + i + `">
                        <div class="myc-date-number">` + d.getDate() + mname + `</div>
                        <div class="myc-date-display">` + settings.weekdays[d.getDay()] + `</div>
                    </div>
                `;
            }
            var ret = `<div id="myc-dates-container">` + tmp + `</div>`;
            return ret;
        }

        // kuhanin ang mga pwedeng oras sa bawat araw ng kasalukuyang linggo
        this.getAvailableTimes = function() {
            var tmp = ``;
            
            /* Garcia: Daten können auch in anderen format dayHM übergeben werdn key = iso date yyyy-mm-dd*/
             if( settings.dayHM != undefined ){
                //alert("settings.dayHM:\n" + jstr(settings.dayHM ));
                    
                var hA = [];
                for (i = 0; i < 7; i++) {

                    var tmpAvailTimes = ``;
                    
                    hA.push( `<div class="myc-day-time-container" id="myc-day-time-container-` + i + `">` );
                    
                    var isoDate = formatDate(settings.startDate.addDays(i) );
                    
                    var timeA = settings.dayHM[ isoDate ];
                    
                    
                    /* times for day */
                    if( timeA != undefined ){
                        
                        //alert("timeA:" + jstr( timeA ) );
                        
                        for( var tx in timeA ){
                           
                            
                           hA.push(`<a href="javascript:;" class="myc-available-time" data-uid="` + timeA[tx].uid + `" data-time="` + timeA[tx].time + `" data-date="` + isoDate + `">`);
                           hA.push( timeA[tx].time );
                           hA.push( `</a>` );
                        }
                    }
                    
                    
                    hA.push( `<div style="clear:both;"></div></div>` );
                }                
                //alert("retirn hA!");
                return hA.join("");
                    
                    
                    
                    
             }
            
            
/*            
settings.dayHM:
{
  "2021-05-31": [
    {
      "time": "1:00",
      "uid": "abc1234"
    }
  ],
  "2021-06-01": [
    {
      "time": "2:00",
      "uid": "222abc1234"
    }
  ],
  "2021-06-02": [
    {
      "time": "3:00",
      "uid": "222abc1234"
    }
  ]
}            
*/            
            
            for (i = 0; i < 7; i++) {
                
                var tmpAvailTimes = ``;
                $.each(settings.availability[i], function() {
                    /* alert("instanceof string: " + jstr(this) ); */
                    /* Garcia: Wenn obj übergeben, dann noch uid mit reinschrieben */
                        tmpAvailTimes += `
                            <a href="javascript:;" class="myc-available-time" data-uid="` + this.uid + `" data-time="` + this.time + `" data-date="` + formatDate(settings.startDate.addDays(i)) + `">
                                ` + this.time + `
                            </a>
                        `;
                        
/*
 * nstanceof string: {
  "time": "1:00",
  "uid": "abc1234"
}                        
*/                        
                    
                    /*
                    else{
                        tmpAvailTimes += `
                            <a href="javascript:;" class="myc-available-time" data-time="` + this + `" data-date="` + formatDate(settings.startDate.addDays(i)) + `">
                                ` + this + `
                            </a>
                        `;
                    }
                    */
                });
           
                
                tmp += `
                    <div class="myc-day-time-container" id="myc-day-time-container-` + i + `">
                        ` + tmpAvailTimes + `
                        <div style="clear:both;"></div>
                    </div>
                `;
            }
            return tmp
        }

        // i-set ang mga oras na pwedeng ilaan
        this.setAvailability = function(arr) {
            settings.availability = arr;
            render();
        }
        
        /* Garcia: getter für Settings */
        this.getSettings = function(){
            return settings;
        }


        // clear
        this.clearAvailability = function() {
            settings.availability = [[], [], [], [], [], [], []];
        }

        // pag napindot ang nakaraang linggo
        this.on('click', '#myc-prev-week', function() {
            settings.startDate = settings.startDate.addDays(-7);
            instance.clearAvailability();
            render(instance);

            if ($.isFunction(onClickNavigator)) {
                onClickNavigator.call(this, ...arguments, instance);
            }
        });

        // pag napindot ang susunod na linggo
        this.on('click', '#myc-next-week', function() {
            settings.startDate = settings.startDate.addDays(7);
            instance.clearAvailability();
            render(instance);

            if ($.isFunction(onClickNavigator)) {
                onClickNavigator.call(this, ...arguments, instance);
            }
        });

        // pag namili ng oras
        
        /* Garcia: remove all prev evnet handlers! */
        this.off('click', '.myc-available-time' );
        
        
        this.on('click', '.myc-available-time', function() {
            var date = $(this).data('date');
            var time = $(this).data('time');
            var tmp = date + ' ' + time;
            
            var selectedUids = [];
            
            
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected');
                var idx = settings.selectedDates.indexOf(tmp);
                if (idx !== -1) {
                    settings.selectedDates.splice(idx, 1);
                }
            } else {
                if (settings.isMultiple) {
                    $(this).addClass('selected');
                    settings.selectedDates.push(tmp);
                } else {
                    
                    selectedUids.push( $(this).data('uid') );
                    
                    settings.selectedDates.pop();
                    if (!settings.selectedDates.length) {
                        $('.myc-available-time').removeClass('selected');
                        $(this).addClass('selected');
                        settings.selectedDates.push(tmp);
                    }
                }
            }
            
            
            
            if ($.isFunction(onClick)) {
                
                //alert("click on myc-available-time!");
                
                onClick.call(this, ...arguments, settings.selectedDates,selectedUids);
            }
        });

        var render = function() {
            ret = `
                <div id="myc-container">
                    <div id="myc-nav-container">` + instance.getNavControl() + `</div>
                    <div id="myc-week-container">
                        <div id="myc-dates-container">` + instance.getDatesHeader() + `</div>
                        <div id="myc-available-time-container">` + instance.getAvailableTimes() + `</div>
                    </div>
                </div>
            `;
            instance.html(ret);
        };

        render();
    };
})(jQuery);