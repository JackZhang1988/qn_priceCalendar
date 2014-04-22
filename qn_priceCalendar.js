
(function($, window, document, undefined ){

	var Calendar=function(element,options){
		this.$container=element;
		this.options=$.extend(true,{},$.fn.qn_priceCalendar.defaults,options);

		this._defaults=$.fn.qn_priceCalendar.defaults;

		this.$self={};
		this.init();
	};
	Calendar.prototype.init=function(){
		this.createCalendarTemp();
	};
	Calendar.prototype.clickPre=function(e){
		this.options.date.setMonth(this.options.date.getMonth()-1);
	};
	Calendar.prototype.clickNext=function(e){
		this.options.date.setMonth(this.options.date.getMonth()+1);
	};
	Calendar.prototype.showCalendar=function(){
		this.createSingletonDom();
		this.$self.css(this.options.css).show();
	};
	Calendar.prototype.bindEvents=function(){
		var $self=this.$self,Calendar=this;
		$self.on('click','#pre',function(e){
			e.stopPropagation();
			$self.trigger('changeCal:pre');
			Calendar.clickPre(e);
			$self.trigger('renderCal',Calendar);
		});
		$self.on('click','#next',function(e){
			e.stopPropagation();
			$self.trigger('changeCal:next');
			Calendar.clickNext(e);
			$self.trigger('renderCal',Calendar);
		});
		$self.on('renderCal',function($this,Calendar){
			$self.html('');
			Calendar.showCalendar(Calendar.createCalendarTemp());
		});
		$self.on('click','table tr td[data-date].clickable',function(e){
			e.stopPropagation();
			$self.trigger('dateSelected',new Date($(e.currentTarget).data('date')));
		});
		$(document).on('mousedown',function(e){
			var $target=$(e.target);
			if($self.html() && $self.find($target).length ===0){
				$self.hide();
			}
		});
		$self.on('dateSelected',function(obj,date){
			if(Calendar.options.dateSelected && typeof Calendar.options.dateSelected == 'function'){
				// Calendar.options.dateSelected.apply(Calendar,[date]);
				Calendar.options.dateSelected(date);
			}
			else {
				if(Calendar.$container){
					Calendar.$container.val(date.toLocaleDateString());
				}
			}
			return $self.hide();
		});
		$self.on('test',function(){
			alert(123);
		})
	};
	Calendar.prototype.isActive=function(curDate){
		if(!this.options.maxDate || !this.options.minDate){
			return true;
		}
		if(this.options.maxDate >=curDate && this.options.minDate <= curDate){
			return true;
		}
		return false;
	};
	Calendar.prototype.dateTemp=function(dataAttr,dateVal,isActive){
		return isActive?'<td data-date="'+dataAttr+'"><div class="date">'+dateVal+'</div><div class="dateInfo"></div>&nbsp;</td>':'<td data-date="'+dataAttr+'" class="inActive"><div class="date">'+dateVal+'</div><div class="dateInfo"></div>&nbsp;</td>';
	}
	Calendar.prototype.createSingletonDom=function(){
		var $orignal=$("#priceCalendar");
		if($orignal){
			$orignal.remove();
		}
       	$('body').append(this.$self);
	}
	Calendar.prototype.getWeekTemplate=function(firstDay,weekNumClassObj){
		firstDay=firstDay>6?this._defaults.firstDay:firstDay;
		var weekName=['一','二','三','四','五','六','日'];
		var weekTempStr="";
		for(var i=this.options.firstDay,j=0;j<7;j++){
			if(weekNumClassObj[i]){
				weekTempStr+='<th class="'+weekNumClassObj[i]+'" >'+weekName[i]+'</th>'
			}
			else{
				weekTempStr+='<th>'+weekName[i]+'</th>';
			}
			i=(++i)%7;
		}
		return weekTempStr;
	}
	Calendar.prototype.createCalendarTemp=function(){
		var month=this.options.date.getMonth()+1,
			year=this.options.date.getFullYear(),
			headerTemplate='<div class="calendar-header"><span id="pre" class="arrow"></span><span id="next" class="arrow"></span><div class="calendar-title"><span>'+this.options.date.toLocaleString().substring(0,7)+'</span></div></div class="calendarHeader">';

		var	bodyTemplate='<table class="priceCalendar" cellpadding="0" cellpadding="0">'+
                '<thead>'+
                '<tr>'+this.getWeekTemplate(this.options.firstDay,this.options.weekNumClass)+'</tr>'+
                '</thead>'+
                '<tbody class="calendarList"></tbody></table>';
        var monthDayCount=Helper.sumDaysOfMonth(month,year),weekNum=Helper.getWeekNumByDate(month,year)-1,weekOffset,calendarHtml=['<tr>'],maxDay;
        weekOffset=this.options.firstDay>weekNum?(weekNum+7-this.options.firstDay):(weekNum-this.options.firstDay);
        for(var day=1,j=monthDayCount,m=1;day<=j;m++){
        	var dateStr=Helper.formatDate(month,day,year);
        	var dateEle=this.dateTemp(dateStr,day,this.isActive(dateStr));
        	if(m%7 ==0){
        		calendarHtml.push(dateEle);
        		calendarHtml.push('<tr>');
        		day++;
        	}else if(m>weekOffset){
        		calendarHtml.push(dateEle);
        		day++;
        	}else if(m<=weekOffset){
        		calendarHtml.push('<td></td>');
        	} 
       	}
       	calendarHtml.push('</tr>')
       	var $template =$('<div id="priceCalendar" style="display:none">'+headerTemplate+bodyTemplate+'</div>');
       	$template.find('tbody').html(calendarHtml.join(''));
       	var checkDate=year+'-'+(month.toString().length==1?'0'+month:month);
		if(this.options.maxDate){
			if(this.options.maxDate.substring(0,7)==checkDate){
				$template.find('#next').hide();
			}
		}
		if(this.options.minDate){
			if(this.options.minDate.substring(0,7)==checkDate){
				$template.find('#pre').hide();
			}
		}
       	this.$self=$template;
		if(this.options.dateInfoList && this.options.dateInfoList.length){
			this.renderCalendarWithAllData(this.options.dateInfoList);
		}
		this.bindEvents();
		return this;
	};
	Calendar.prototype.renderCalendarByDate=function(date,dateInfoHtml){
		var temp=this.$self.find('td[data-date="'+date+'"]').addClass('clickable');
		this.$self.find('td[data-date="'+date+'"] .dateInfo').append(dateInfoHtml);
	};
	Calendar.prototype.renderCalendarWithAllData=function(dataList,renderData){
		for(var day=0,j=dataList.length;day<j;day++){
			if(dataList[day].date && dataList[day].price){
				var dateInfoHtml="<div class='price'>"+'￥'+dataList[day].price+"</div><div class='food'>"+dataList[day].breakfast+"</div>" ;
				var dateInfos=dataList[day].date.split('-');
				this.renderCalendarByDate(Helper.formatDate(dateInfos[1],dateInfos[2],dateInfos[0]),dateInfoHtml);
			}
		}
	};
	Calendar.prototype.pushInfoByDate=function(date,dateInfoEle){
		this.renderCalendarByDate(date,dateInfoEle);
		this.$self.trigger('rerender');
	};
	Calendar.prototype.remove = function(){
		this.$self.remove();
	};
	var Helper={
		parseDate:function(date){
			return this.isDate(date)?date:isNaN(newDate)?(new Date()):newDate;
		},
		isDate:function(date){
			return date instanceof Date && !isNaN(date.valueOf());
		},
		isLeapYear:function (year){
			return (year%4 === 0 && year%100 !== 0) || (year %400 === 0);
		},
		sumDaysOfYear:function(year){
			return this.isLeapYear(year)?366:365;
		},
		sumDaysOfMonth:function(month,year){
			if(month == 2){
				return this.isLeapYear(year)?29:28;
			} 
			switch(month){
				case 1:;
				case 3:;
				case 5:;
				case 7:;
				case 8:;
				case 10:;
				case 12: return 31;
				case 4:;
				case 6:;
				case 9:
				case 11: return 30;
				default:
					throw('invalid month');
					break;
				}
		},
		sumDaysFromYear:function(month,year){
			var sum=0;
			for(var j=month-1;j>0;j--){
				sum+=this.sumDaysOfMonth(j,year);
			}
			return sum;
		},
		totalDays:function(month,year){
			var total=this.sumDaysFromYear(month,year);
			for(var day=year;day>1900;day--){
				total+=this.sumDaysOfYear(year);
			}
			return total;
		},
		getWeekNumByDate:function(month,year){
			var m = parseInt(month,10), y =parseInt(year,10);
			var t = this.totalDays(m,y);
			return t%7+1;
		},
		formatDate:function(month,day,year){
			return year+'-'+(month.toString().length==1?'0'+month:month)+'-'+(day.toString().length==1?'0'+day:day);
		}
	}

	$.fn.qn_priceCalendar=function(options){
		if(this.length === 1){
			var cal_instance=new Calendar(this,options);
			this.on('focus',function(){
				cal_instance.createCalendarTemp().showCalendar();
			});
			return cal_instance;
		}
		else if(this.length === 0){
			return (new Calendar(null,options)).createCalendarTemp();
		}
		else if(this.length > 1){
			throw "we don't support multi selector yet!";
		}
	}
	$.fn.qn_priceCalendar.defaults={
		date:new Date(),
		dateInfoList:[],
		firstDay:5,
		weekNumClass:{
			5:'yellow',
			6:'yellow'
		},
		css:{
			top:'100px',
			left:'100px'
		}
	}
})( jQuery, window, document)