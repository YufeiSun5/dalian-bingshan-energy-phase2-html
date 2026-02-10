/**
 * 热泵系统管理系统 - 主脚本文件
 * 包含所有页面逻辑、数据管理和交互功能
 * 
 * ============================================
 * 🎛️ 开发者配置说明
 * ============================================
 * 
 * 1. DEBUG_SHOW_HOVER_ZONES (悬浮区域调试开关)
 *    - true:  显示黄色虚线边框，方便调整悬浮区域位置
 *    - false: 隐藏边框（生产环境，当前状态）
 * 
 * 2. CARD_HIDE_DELAY (卡片隐藏延迟)
 *    - 默认: 300ms（行业标准）
 *    - 说明: 鼠标离开后多久隐藏卡片
 * 
 * 3. DEBUG_LOG (控制台日志开关)
 *    - true:  输出详细的调试日志
 *    - false: 关闭调试日志（生产环境，当前状态）
 * 
 * ============================================
 */

// ============================================
// 0. 全局配置
// ============================================
const AppConfig = {
	// 调试模式：是否显示悬浮区域边框
	// true: 显示黄色虚线边框，方便调整位置
	// false: 隐藏边框，正常使用模式（当前状态）
	DEBUG_SHOW_HOVER_ZONES: false,
	
	// 卡片显示延迟时间（毫秒）
	// 默认300ms是行业标准，给用户足够时间移动到卡片
	CARD_HIDE_DELAY: 300,
	
	// 日志输出
	// true: 输出详细日志，false: 关闭日志（当前状态）
	DEBUG_LOG: false
};

// ============================================
// 1. 模拟数据（开发阶段使用，后期替换为真实接口）
// ============================================
const MockData = {
	// 大办系统数据
	daban: {
		totalInlet: { pressure: '0.45 MPa', flow: '120 m³/h', temp: '35.2°C' },
		totalOutlet: { pressure: '0.38 MPa', temp: '45.8°C' },
		ambientTemp: '18.5°C',
		units: [
			{ id: 1, inletTemp: '35.5°C', outletTemp: '45.2°C' },
			{ id: 2, inletTemp: '35.3°C', outletTemp: '45.5°C' },
			{ id: 3, inletTemp: '35.6°C', outletTemp: '45.3°C' },
			{ id: 4, inletTemp: '35.4°C', outletTemp: '45.6°C' },
			{ id: 5, inletTemp: '35.7°C', outletTemp: '45.4°C' },
			{ id: 6, inletTemp: '35.2°C', outletTemp: '45.7°C' }
		]
	},
	// 东大棚系统数据
	dongdapeng: {
		totalInlet: { pressure: '0.42 MPa', flow: '95 m³/h', temp: '33.8°C' },
		totalOutlet: { pressure: '0.35 MPa', temp: '43.5°C' },
		ambientTemp: '17.2°C',
		units: [
			{ id: 1, inletTemp: '33.9°C', outletTemp: '43.2°C' },
			{ id: 2, inletTemp: '33.7°C', outletTemp: '43.6°C' },
			{ id: 3, inletTemp: '33.8°C', outletTemp: '43.4°C' },
			{ id: 4, inletTemp: '33.6°C', outletTemp: '43.7°C' },
			{ id: 5, inletTemp: '33.5°C', outletTemp: '43.3°C' }
		]
	},
	// 研发系统数据
	yanfa: {
		totalInlet: { pressure: '0.48 MPa', flow: '110 m³/h', temp: '36.5°C' },
		totalOutlet: { pressure: '0.40 MPa', temp: '46.2°C' },
		ambientTemp: '19.8°C',
		units: [
			{ id: 1, inletTemp: '36.6°C', outletTemp: '46.0°C' },
			{ id: 2, inletTemp: '36.4°C', outletTemp: '46.3°C' },
			{ id: 3, inletTemp: '36.5°C', outletTemp: '46.1°C' },
			{ id: 4, inletTemp: '36.3°C', outletTemp: '46.4°C' }
		]
	}
};

// ============================================
// 2. 数据更新函数
// ============================================
function updateSystemData(systemType) {
	const data = MockData[systemType];
	if (!data) return;

	// 根据系统类型确定数据ID前缀
	let prefix = '';
	let totalPrefix = '';  // 总进出水的前缀
	if (systemType === 'daban') {
		prefix = '';
		totalPrefix = 'total-';  // 大办使用 total- 前缀
	} else if (systemType === 'dongdapeng') {
		prefix = 'dd-';
		totalPrefix = 'dd-';
	} else if (systemType === 'yanfa') {
		prefix = 'yf-';
		totalPrefix = 'yf-';
	}

	// 更新总进水数据
	$(`#${totalPrefix}inlet-pressure`).text(data.totalInlet.pressure);
	$(`#${totalPrefix}inlet-flow`).text(data.totalInlet.flow);
	$(`#${totalPrefix}inlet-temp`).text(data.totalInlet.temp);

	// 更新总出水数据
	$(`#${totalPrefix}outlet-pressure`).text(data.totalOutlet.pressure);
	$(`#${totalPrefix}outlet-temp`).text(data.totalOutlet.temp);
	
	// 更新环境温度
	$(`#${prefix}ambient-temp`).text(data.ambientTemp || '---');

	// 更新各机组数据
	data.units.forEach(unit => {
		$(`#${prefix}unit${unit.id}-inlet-temp`).text(unit.inletTemp);
		$(`#${prefix}unit${unit.id}-outlet-temp`).text(unit.outletTemp);
	});
}

// ============================================
// 3. 页面切换管理
// ============================================
const PageManager = {
	currentPage: '',
	
	init: function() {
		this.bindEvents();
		this.showPage('real-time-data');
	},
	
	bindEvents: function() {
		$('.nav-link').on('click', (e) => {
			e.preventDefault();
			const pageId = $(e.currentTarget).data('page');
			this.showPage(pageId);
			this.updateNavigation(pageId);
		});
	},
	
	showPage: function(pageId) {
		if (this.currentPage === pageId) return;
		
		$('.page-container').removeClass('active');
		$('#' + pageId + '-page').addClass('active');
		this.currentPage = pageId;
		
		// 初始化页面对应的功能模块
		this.initPageModule(pageId);
	},
	
	initPageModule: function(pageId) {
		// 确保页面切换动画完成后再初始化模块
		setTimeout(() => {
			console.log('正在初始化页面模块:', pageId);
			
			switch(pageId) {
				case 'heat-pump-system-report':
					// 初始化报表模块
					if (window.ReportModule) {
						window.ReportModule.init();
					} else {
						console.error('ReportModule模块未找到');
					}
					break;
				case 'heat-pump-system-curve':
					// 初始化曲线模块
					if (window.CurveModule) {
						window.CurveModule.init();
						// 确保图表正确显示
						setTimeout(() => {
							if (window.CurveModule.chartInstance) {
								window.CurveModule.chartInstance.resize();
							}
						}, 300);
					} else {
						console.error('CurveModule模块未找到');
					}
					break;
			}
		}, 200);
	},
	
	updateNavigation: function(pageId) {
		$('.nav-link').removeClass('active');
		$('.nav-link[data-page="' + pageId + '"]').addClass('active');
	}
};

// ============================================
// 4. 数据面板切换管理
// ============================================
const PanelManager = {
	init: function() {
		$('.switch-btn').on('click', function() {
			const targetId = $(this).data('target');
			
			// 更新按钮状态
			$('.switch-btn').removeClass('active');
			$(this).addClass('active');
			
			// 切换面板
			$('.data-panel').removeClass('active').hide();
			$('#' + targetId).addClass('active').show();
			
			// 更新对应系统的数据
			const systemMap = {
				'data-panel-1': 'daban',
				'data-panel-2': 'dongdapeng',
				'data-panel-3': 'yanfa'
			};
			const systemType = systemMap[targetId];
			if (systemType) {
				updateSystemData(systemType);
				
				// 延迟resize甘特图，确保容器尺寸已更新
				setTimeout(() => {
					GanttChartManager.resize();
				}, 100);
			}
		});
	}
};

// ============================================
// 5. 悬浮卡片管理器
// ============================================
const HoverCardManager = {
	currentPanel: null,
	currentPump: null,
	hideTimer: null,

	init: function() {
		// 应用调试模式样式
		this.applyDebugStyles();
		// 绑定事件
		this.bindHoverEvents();
		this.bindCardEvents();
	},
	
	applyDebugStyles: function() {
		if (AppConfig.DEBUG_SHOW_HOVER_ZONES) {
			// 开启调试模式：显示悬浮区域边框
			const style = `
				<style id="hover-zone-debug-style">
					.image-hover-zone > div {
						border: 2px dashed rgba(255, 255, 0, 0.6) !important;
						background: rgba(255, 255, 0, 0.1) !important;
					}
					.image-hover-zone > div:hover {
						border-color: rgba(255, 0, 0, 0.8) !important;
						background: rgba(255, 0, 0, 0.2) !important;
					}
				</style>
			`;
			$('head').append(style);
			console.log('✅ 调试模式：悬浮区域边框已开启');
		} else {
			console.log('✅ 生产模式：悬浮区域边框已隐藏');
		}
	},

	bindHoverEvents: function() {
		if (AppConfig.DEBUG_LOG) console.log('绑定悬浮区域事件...');
		const $hoverZones = $('.image-hover-zone > div');
		if (AppConfig.DEBUG_LOG) console.log('找到悬浮区域数量:', $hoverZones.length);

		// 为所有悬浮区域绑定事件
		$hoverZones.on('mouseenter', (e) => {
			if (AppConfig.DEBUG_LOG) console.log('鼠标进入悬浮区域');
			const $target = $(e.currentTarget);
			const pumpId = $target.data('pump');
			const panelId = $target.data('panel');
			if (AppConfig.DEBUG_LOG) console.log('悬浮区域数据:', { pumpId, panelId });
			
			// 取消任何待执行的隐藏操作
			this.cancelHide();
			
			// 如果鼠标移到不同的热泵区域，立即切换
			if (this.currentPump !== null && this.currentPump !== pumpId) {
				if (AppConfig.DEBUG_LOG) console.log('移动到不同区域，立即切换卡片');
			}
			
			// 显示对应的卡片
			this.showPumpCard(panelId, pumpId);
		}).on('mouseleave', (e) => {
			if (AppConfig.DEBUG_LOG) console.log('鼠标离开悬浮区域');
			
			// 检查鼠标是否移到了对应的卡片区域
			// 延迟隐藏，给用户时间移动到卡片
			this.scheduleHide();
		});
	},

	bindCardEvents: function() {
		// 监听卡片本身的鼠标事件（不是容器）
		// 使用事件委托，监听 .pump-card 而不是 .pump-cards-section
		$(document).on('mouseenter', '.pump-card.active', (e) => {
			if (AppConfig.DEBUG_LOG) console.log('鼠标进入激活的卡片');
			// 取消隐藏定时器
			this.cancelHide();
		}).on('mouseleave', '.pump-card.active', (e) => {
			if (AppConfig.DEBUG_LOG) console.log('鼠标离开激活的卡片');
			// 延迟隐藏
			this.scheduleHide();
		});
		
		// 页面切换时隐藏悬浮层
		$('.nav-link').on('click', () => {
			this.hideAllCards();
		});

		// 数据面板切换时隐藏悬浮层
		$('.switch-btn').on('click', () => {
			this.hideAllCards();
		});
	},

	showPumpCard: function(panelId, pumpId) {
		if (AppConfig.DEBUG_LOG) console.log('显示热泵卡片:', { panelId, pumpId });

		// 取消之前的隐藏定时器（立即切换，不等待）
		this.cancelHide();

		// 如果是相同的热泵且悬浮层已显示，不重复操作
		const isSamePump = (this.currentPanel === panelId && this.currentPump === pumpId);
		const $currentSection = $(`#data-panel-${panelId} .pump-cards-section`);
		const isAlreadyVisible = $currentSection.hasClass('visible');
		
		if (isSamePump && isAlreadyVisible) {
			if (AppConfig.DEBUG_LOG) console.log('相同热泵且已显示，跳过');
			return;
		}

		// 更新当前状态
		this.currentPanel = panelId;
		this.currentPump = pumpId;

		// 找到对应的悬浮层
		const $cardsSection = $(`#data-panel-${panelId} .pump-cards-section`);
		if (AppConfig.DEBUG_LOG) console.log('找到卡片区域:', $cardsSection.length > 0 ? '成功' : '失败');

		// 隐藏所有悬浮层
		$('.pump-cards-section').removeClass('visible');

		// 隐藏所有卡片，移除激活状态和高亮
		$('.pump-cards-container .pump-card').removeClass('active').removeClass('highlighted');

		// 只显示当前热泵对应的单个卡片
		const $targetCard = $cardsSection.find(`.pump-card[data-pump="${pumpId}"]`);
		if (AppConfig.DEBUG_LOG) console.log('找到目标卡片:', $targetCard.length > 0 ? '成功' : '失败');
		$targetCard.addClass('active').addClass('highlighted');

		// 立即显示悬浮层（无需延迟，实现快速切换）
		$cardsSection.addClass('visible');
		if (AppConfig.DEBUG_LOG) console.log('显示悬浮层完成');
	},

	scheduleHide: function() {
		// 清除之前的定时器
		this.cancelHide();

		// 设置新的隐藏定时器
		this.hideTimer = setTimeout(() => {
			this.hideAllCards();
		}, AppConfig.CARD_HIDE_DELAY);
	},

	cancelHide: function() {
		if (this.hideTimer) {
			clearTimeout(this.hideTimer);
			this.hideTimer = null;
		}
	},

	hideAllCards: function() {
		if (AppConfig.DEBUG_LOG) console.log('隐藏所有卡片');
		this.cancelHide();
		$('.pump-cards-section').removeClass('visible');
		$('.pump-cards-container .pump-card').removeClass('active').removeClass('highlighted');
		this.currentPanel = null;
		this.currentPump = null;
	}
};

// ============================================
// 6. 连接面与卡片联动（已弃用）
// ============================================
const ConnectionManager = {
	init: function() {
		// 由于连接面已被删除，这里保留空函数以维持兼容性
		console.log('连接面功能已移除，使用悬浮卡片功能替代');
	}
};

// ============================================
// 7. 甘特图管理器
// ============================================
const GanttChartManager = {
	charts: {},

	init: function() {
		this.initGanttChart('daban', 6);
		this.initGanttChart('dongdapeng', 5);
		this.initGanttChart('yanfa', 4);
	},

	initGanttChart: function(systemType, unitCount) {
		const chartId = `gantt-chart-${systemType}`;
		const chartDom = document.getElementById(chartId);
		
		if (!chartDom) {
			console.error(`找不到甘特图容器: ${chartId}`);
			return;
		}

		// 初始化ECharts实例
		const myChart = echarts.init(chartDom);
		this.charts[systemType] = myChart;

		// 生成模拟数据
		const data = this.generateMockData(unitCount);

		// 配置甘特图选项
		const option = {
			backgroundColor: 'transparent',
			title: {
				show: false
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow'
				},
				backgroundColor: 'rgba(29, 56, 111, 0.95)',
				borderColor: 'rgba(74, 144, 226, 0.6)',
				textStyle: {
					color: '#fff'
				},
				formatter: function(params) {
					const item = params[0];
					const startTime = new Date(item.value[1]).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
					const endTime = new Date(item.value[2]).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
					return `${item.name}<br/>运行时段: ${startTime} - ${endTime}`;
				}
			},
			color: ['#2ed573', '#ff4d4f', '#ffc107'],  // 绿色运行、黄色故障、红色停机
			legend: {
				data: ['运行', '故障', '停机'],
				top: 10,
				right: 20,
				textStyle: {
					color: '#b9d3f4',
					fontSize: 12
				}
			},
			grid: {
				left: 80,
				right: 30,
				top: 50,
				bottom: 30,
				containLabel: false
			},
			xAxis: {
				type: 'time',
				axisLabel: {
					color: '#b9d3f4',
					fontSize: 11,
					formatter: function(value) {
						return new Date(value).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
					}
				},
				axisLine: {
					lineStyle: {
						color: 'rgba(74, 144, 226, 0.3)'
					}
				},
				splitLine: {
					show: true,
					lineStyle: {
						color: 'rgba(74, 144, 226, 0.15)'
					}
				}
			},
			yAxis: {
				type: 'category',
				data: data.categories,
				axisLabel: {
					color: '#b9d3f4',
					fontSize: 11,
					fontWeight: 'bold'
				},
				axisLine: {
					lineStyle: {
						color: 'rgba(74, 144, 226, 0.3)'
					}
				},
				splitLine: {
					show: true,
					lineStyle: {
						color: 'rgba(74, 144, 226, 0.1)'
					}
				}
			},
			series: [
				{
					name: '运行',
					type: 'custom',
					renderItem: this.renderGanttItem,
					itemStyle: {
						opacity: 0.9
					},
					encode: {
						x: [1, 2],
						y: 0
					},
					data: data.runningData
				},
				{
					name: '故障',
					type: 'custom',
					renderItem: this.renderGanttItem,
					itemStyle: {
						opacity: 0.9
					},
					encode: {
						x: [1, 2],
						y: 0
					},
					data: data.faultData
				},
				{
					name: '停机',
					type: 'custom',
					renderItem: this.renderGanttItem,
					itemStyle: {
						opacity: 0.9
					},
					encode: {
						x: [1, 2],
						y: 0
					},
					data: data.stoppedData
				}
			]
		};

		myChart.setOption(option);

		// 响应式调整
		window.addEventListener('resize', () => {
			myChart.resize();
		});
	},

	renderGanttItem: function(params, api) {
		const categoryIndex = api.value(0);
		const start = api.coord([api.value(1), categoryIndex]);
		const end = api.coord([api.value(2), categoryIndex]);
		const height = api.size([0, 1])[1] * 0.6;
		
		const rectShape = echarts.graphic.clipRectByRect({
			x: start[0],
			y: start[1] - height / 2,
			width: end[0] - start[0],
			height: height
		}, {
			x: params.coordSys.x,
			y: params.coordSys.y,
			width: params.coordSys.width,
			height: params.coordSys.height
		});

		// 根据系列名称设置颜色：绿色-运行，黄色-故障，红色-停机
		let color;
		if (params.seriesName === '运行') {
			// 绿色 - 运行
			color = new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
				offset: 0,
				color: 'rgba(46, 213, 115, 0.8)'
			}, {
				offset: 1,
				color: 'rgba(39, 174, 96, 0.8)'
			}]);
		} else if (params.seriesName === '故障') {
			// 黄色 - 故障
			color = new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
				offset: 0,
				color: 'rgba(255, 193, 7, 0.8)'
			}, {
				offset: 1,
				color: 'rgba(255, 165, 2, 0.8)'
			}]);
		} else {
			// 红色 - 停机
			color = new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
				offset: 0,
				color: 'rgba(255, 77, 79, 0.8)'
			}, {
				offset: 1,
				color: 'rgba(255, 56, 96, 0.8)'
			}]);
		}

		return rectShape && {
			type: 'rect',
			transition: ['shape'],
			shape: rectShape,
			style: {
				...api.style(),
				fill: color
			}
		};
	},

	generateMockData: function(unitCount) {
		const categories = [];
		const runningData = [];
		const faultData = [];
		const stoppedData = [];
		
		// 时间范围：昨天7:00 到 今天7:00（24小时）
		const now = new Date();
		const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0);
		const startTime = new Date(endTime.getTime() - 24 * 3600 * 1000); // 昨天7:00
		
		const totalDuration = endTime.getTime() - startTime.getTime(); // 24小时的毫秒数
		
		for (let i = 1; i <= unitCount; i++) {
			categories.push(`热泵${i}`);
			
			let currentTime = startTime.getTime();
			const endTimeMs = endTime.getTime();
			
			// 持续生成时间段，直到填满24小时
			while (currentTime < endTimeMs) {
				const remainingTime = endTimeMs - currentTime;
				
				// 随机选择状态：运行(60%)、故障(10%)、停机(30%)
				const rand = Math.random();
				
				if (rand < 0.6) {
					// 运行状态 - 绿色
					// 随机时长：1-6小时，但不超过剩余时间
					const maxDuration = Math.min(6 * 3600 * 1000, remainingTime);
					const minDuration = Math.min(1 * 3600 * 1000, remainingTime);
					const duration = minDuration + Math.random() * (maxDuration - minDuration);
					
					runningData.push({
						name: `热泵${i}`,
						value: [i - 1, currentTime, currentTime + duration],
						itemStyle: { normal: { color: 'rgba(46, 213, 115, 0.8)' } }
					});
					currentTime += duration;
					
				} else if (rand < 0.7) {
					// 故障状态 - 黄色
					// 随机时长：0.2-1.5小时，但不超过剩余时间
					const maxDuration = Math.min(1.5 * 3600 * 1000, remainingTime);
					const minDuration = Math.min(0.2 * 3600 * 1000, remainingTime);
					const duration = minDuration + Math.random() * (maxDuration - minDuration);
					
					faultData.push({
						name: `热泵${i}`,
						value: [i - 1, currentTime, currentTime + duration],
						itemStyle: { normal: { color: 'rgba(255, 193, 7, 0.8)' } }
					});
					currentTime += duration;
					
				} else {
					// 停机状态 - 红色
					// 随机时长：0.5-3小时，但不超过剩余时间
					const maxDuration = Math.min(3 * 3600 * 1000, remainingTime);
					const minDuration = Math.min(0.5 * 3600 * 1000, remainingTime);
					const duration = minDuration + Math.random() * (maxDuration - minDuration);
					
					stoppedData.push({
						name: `热泵${i}`,
						value: [i - 1, currentTime, currentTime + duration],
						itemStyle: { normal: { color: 'rgba(255, 77, 79, 0.8)' } }
					});
					currentTime += duration;
				}
			}
		}
		
		return {
			categories,
			runningData,
			faultData,
			stoppedData
		};
	},

	resize: function() {
		Object.values(this.charts).forEach(chart => {
			chart && chart.resize();
		});
	}
};

// ============================================
// 8. 控制台数据更新方法（供开发调试使用）
// ============================================

/**
 * 更新单个面板的实时数据（内部方法）
 * @param {string} panelName - 面板名称
 * @param {object} data - 数据对象
 * @param {object} panelInfo - 面板信息
 */
function updateSinglePanelRealtimeData(panelName, data, panelInfo) {
	const { prefix, panel } = panelInfo;
	let updateCount = 0;
	
	// 确定总进出水的前缀（大办使用 total-，其他使用各自前缀）
	const totalPrefix = panelName === 'daban' ? 'total-' : prefix;
	
	// 1. 更新浮窗数据（总进水、总出水、环境温度）
	if (data.totalInlet) {
		if (data.totalInlet.pressure) $(`#${totalPrefix}inlet-pressure`).text(data.totalInlet.pressure);
		if (data.totalInlet.flow) $(`#${totalPrefix}inlet-flow`).text(data.totalInlet.flow);
		if (data.totalInlet.temp) $(`#${totalPrefix}inlet-temp`).text(data.totalInlet.temp);
		updateCount++;
	}
	
	if (data.totalOutlet) {
		if (data.totalOutlet.pressure) $(`#${totalPrefix}outlet-pressure`).text(data.totalOutlet.pressure);
		if (data.totalOutlet.temp) $(`#${totalPrefix}outlet-temp`).text(data.totalOutlet.temp);
		updateCount++;
	}
	
	// 更新环境温度
	if (data.ambientTemp) {
		$(`#${prefix}ambient-temp`).text(data.ambientTemp);
		updateCount++;
	}
	
	// 2. 更新各机组浮窗温度数据
	if (data.units && Array.isArray(data.units)) {
		data.units.forEach(unit => {
			if (unit.id) {
				if (unit.inletTemp) $(`#${prefix}unit${unit.id}-inlet-temp`).text(unit.inletTemp);
				if (unit.outletTemp) $(`#${prefix}unit${unit.id}-outlet-temp`).text(unit.outletTemp);
			}
		});
		updateCount++;
	}
	
	// 3. 更新悬浮卡片数据
	if (data.pumpCards && Array.isArray(data.pumpCards)) {
		data.pumpCards.forEach(card => {
			const $card = $(`#data-panel-${panel} .pump-card[data-pump="${card.id}"]`);
			if ($card.length > 0) {
				// 更新卡片标题
				if (card.title) {
					$card.find('.pump-card-title').text(card.title);
				}
				
				// 更新卡片内容
				if (card.data && typeof card.data === 'object') {
					Object.keys(card.data).forEach(key => {
						const $row = $card.find(`.pump-info-row:contains("${key}")`);
						if ($row.length > 0) {
							$row.find('.info-value').text(card.data[key]);
						}
					});
				}
			}
		});
		updateCount++;
	}
	
	// 4. 更新电量表格数据
	if (data.powerTable && Array.isArray(data.powerTable)) {
		const tbodyId = panelName === 'daban' ? 'alarm-tbody-daban' : 
		                panelName === 'dongdapeng' ? 'alarm-tbody-dongdapeng' : 
		                'alarm-tbody-yanfa';
		const $tbody = $(`#${tbodyId}`);
		
		if ($tbody.length > 0) {
			$tbody.empty();
			data.powerTable.forEach(row => {
				// 状态转换：1=运行(绿色), 2=故障(黄色), 3=停机(红色)
				let statusText = '运行';
				let statusClass = 'status-running';  // 绿色
				
				if (typeof row.status === 'number') {
					if (row.status === 2) {
						statusText = '故障';
						statusClass = 'status-fault';  // 黄色
					} else if (row.status === 3) {
						statusText = '停机';
						statusClass = 'status-stopped';  // 红色
					} else {
						statusText = '运行';
						statusClass = 'status-running';  // 绿色
					}
				} else {
					// 如果传入的是字符串，直接使用
					statusText = row.status || '运行';
					if (statusText === '故障') {
						statusClass = 'status-fault';
					} else if (statusText === '停机') {
						statusClass = 'status-stopped';
					} else {
						statusClass = 'status-running';
					}
				}
				
				const tr = `
					<tr>
						<td>${row.time || '---'}</td>
						<td>${row.unit || '---'}</td>
						<td>${row.power || '---'}</td>
						<td><span class="alarm-status ${statusClass}">${statusText}</span></td>
					</tr>
				`;
				$tbody.append(tr);
			});
			updateCount++;
		}
	}
	
	return updateCount;
}

/**
 * 更新实时数据（浮窗数据、悬浮卡片数据、电量表格数据）
 * 一次性更新三个画面（大办、东大棚、研发）的数据
 * @param {object} allData - 包含三个面板数据的对象
 */
window.updateRealtimeData = function(allData) {
	console.log('%c════════════════════════════════════════════════════════', 'color: #4a90e2; font-weight: bold');
	console.log('%c[批量更新实时数据] 开始更新三个画面', 'color: #4a90e2; font-weight: bold; font-size: 14px');
	console.log('%c════════════════════════════════════════════════════════', 'color: #4a90e2; font-weight: bold');
	
	const panelMap = {
		'daban': { prefix: '', panel: 1, pumpCount: 7, displayName: '大办' },
		'dongdapeng': { prefix: 'dd-', panel: 2, pumpCount: 5, displayName: '东大棚' },
		'yanfa': { prefix: 'yf-', panel: 3, pumpCount: 4, displayName: '研发' }
	};
	
	let totalUpdates = 0;
	
	// 遍历三个面板，更新每个面板的数据
	Object.keys(panelMap).forEach(panelName => {
		if (allData[panelName]) {
			console.log(`\n%c📊 [${panelMap[panelName].displayName}]`, 'color: #2ed573; font-weight: bold');
			const updateCount = updateSinglePanelRealtimeData(panelName, allData[panelName], panelMap[panelName]);
			console.log(`  ✓ 已更新 ${updateCount} 类数据`);
			totalUpdates += updateCount;
		}
	});
	
	console.log('\n%c════════════════════════════════════════════════════════', 'color: #4a90e2; font-weight: bold');
	console.log(`%c[批量更新完成] 共更新 ${totalUpdates} 类数据`, 'color: #2ed573; font-weight: bold; font-size: 14px');
	console.log('%c════════════════════════════════════════════════════════', 'color: #4a90e2; font-weight: bold');
};

/**
 * 更新单个面板的甘特图数据（内部方法）
 * @param {string} panelName - 面板名称
 * @param {object} ganttData - 甘特图数据
 */
function updateSinglePanelGanttData(panelName, ganttData) {
	const chart = GanttChartManager.charts[panelName];
	if (!chart) {
		console.error(`  ❌ 找不到甘特图实例: ${panelName}`);
		return false;
	}
	
	try {
		// 验证数据格式
		if (!ganttData.devices || !Array.isArray(ganttData.devices)) {
			console.error(`  ❌ 缺少 devices 数组`);
			return false;
		}
		
		// 提取设备名称
		const categories = ganttData.devices.map(device => device.name);
		
		// 转换数据格式：将简化格式转换为ECharts需要的格式
		const runningData = [];
		const faultData = [];
		const stoppedData = [];
		
		ganttData.devices.forEach((device, deviceIndex) => {
			// 1 = 运行（绿色）
			if (device[1] && Array.isArray(device[1])) {
				device[1].forEach(timeRange => {
					if (Array.isArray(timeRange) && timeRange.length === 2) {
						runningData.push({
							name: device.name,
							value: [
								deviceIndex,
								new Date(timeRange[0]).getTime(),
								new Date(timeRange[1]).getTime()
							]
						});
					}
				});
			}
			
			// 2 = 故障（黄色）
			if (device[2] && Array.isArray(device[2])) {
				device[2].forEach(timeRange => {
					if (Array.isArray(timeRange) && timeRange.length === 2) {
						faultData.push({
							name: device.name,
							value: [
								deviceIndex,
								new Date(timeRange[0]).getTime(),
								new Date(timeRange[1]).getTime()
							]
						});
					}
				});
			}
			
			// 3 = 停机（红色）
			if (device[3] && Array.isArray(device[3])) {
				device[3].forEach(timeRange => {
					if (Array.isArray(timeRange) && timeRange.length === 2) {
						stoppedData.push({
							name: device.name,
							value: [
								deviceIndex,
								new Date(timeRange[0]).getTime(),
								new Date(timeRange[1]).getTime()
							]
						});
					}
				});
			}
		});
		
		// 更新甘特图配置
		const option = {
			yAxis: {
				data: categories
			},
			series: [
				{
					name: '运行',
					data: runningData
				},
				{
					name: '故障',
					data: faultData
				},
				{
					name: '停机',
					data: stoppedData
				}
			]
		};
		
		chart.setOption(option);
		console.log(`  ✓ 甘特图已更新：${categories.length}个设备，运行${runningData.length}条，故障${faultData.length}条，停机${stoppedData.length}条`);
		return true;
	} catch (error) {
		console.error(`  ❌ 更新甘特图时出错:`, error);
		return false;
	}
}

/**
 * 更新甘特图数据
 * 一次性更新三个画面（大办、东大棚、研发）的甘特图
 * @param {object} allGanttData - 包含三个面板甘特图数据的对象
 */
window.updateGanttData = function(allGanttData) {
	console.log('%c════════════════════════════════════════════════════════', 'color: #4a90e2; font-weight: bold');
	console.log('%c[批量更新甘特图] 开始更新三个画面', 'color: #4a90e2; font-weight: bold; font-size: 14px');
	console.log('%c════════════════════════════════════════════════════════', 'color: #4a90e2; font-weight: bold');
	
	const panelNames = {
		'daban': '大办',
		'dongdapeng': '东大棚',
		'yanfa': '研发'
	};
	
	let successCount = 0;
	
	// 遍历三个面板，更新每个面板的甘特图
	Object.keys(panelNames).forEach(panelName => {
		if (allGanttData[panelName]) {
			console.log(`\n%c📈 [${panelNames[panelName]}]`, 'color: #2ed573; font-weight: bold');
			const success = updateSinglePanelGanttData(panelName, allGanttData[panelName]);
			if (success) successCount++;
		}
	});
	
	console.log('\n%c════════════════════════════════════════════════════════', 'color: #4a90e2; font-weight: bold');
	console.log(`%c[批量更新完成] 成功更新 ${successCount}/3 个甘特图`, 'color: #2ed573; font-weight: bold; font-size: 14px');
	console.log('%c════════════════════════════════════════════════════════', 'color: #4a90e2; font-weight: bold');
};

// ============================================
// 9. 应用初始化
// ============================================
function initApp() {
	console.log('初始化热泵系统管理系统...');

	// 初始化各个管理器
	PageManager.init();
	PanelManager.init();
	HoverCardManager.init();
	ConnectionManager.init();
	GanttChartManager.init();

	// 加载初始数据
	updateSystemData('daban');

	console.log('系统初始化完成');
	
	// 打印控制台方法使用说明
	printConsoleHelp();
}

// ============================================
// 10. 控制台帮助信息
// ============================================
function printConsoleHelp() {
	console.log('\n');
	console.log('%c════════════════════════════════════════════════════════', 'color: #4a90e2; font-weight: bold');
	console.log('%c  热泵系统 - 开发者调试工具', 'color: #4a90e2; font-weight: bold; font-size: 16px');
	console.log('%c════════════════════════════════════════════════════════', 'color: #4a90e2; font-weight: bold');
	console.log('\n');
	
	console.log('%c📊 方法1: 批量更新实时数据（三个画面一次性更新）', 'color: #2ed573; font-weight: bold; font-size: 14px');
	console.log('%c语法:', 'color: #ffa502; font-weight: bold');
	console.log('  updateRealtimeData(allData)');
	console.log('\n%c参数说明:', 'color: #ffa502; font-weight: bold');
	console.log('  allData: 包含三个面板数据的对象，键名为：');
	console.log('    - daban      (大办，7个设备，含余热回收)');
	console.log('    - dongdapeng (东大棚，5个设备)');
	console.log('    - yanfa      (研发，4个设备)');
	
	console.log('\n%c════════════════════════════════════════════════════════', 'color: #4a90e2; font-weight: bold');
	console.log('%c💡 完整测试示例 - 直接复制下面代码到控制台执行', 'color: #e67e22; font-weight: bold; font-size: 13px');
	console.log('%c════════════════════════════════════════════════════════', 'color: #4a90e2; font-weight: bold');
	
	// 输出可执行的完整示例代码
	const realtimeExample = `updateRealtimeData({
  daban: {
    totalInlet: { pressure: '0.48 MPa', flow: '135 m³/h', temp: '36.8°C' },
    totalOutlet: { pressure: '0.41 MPa', temp: '47.2°C' },
    ambientTemp: '15.5°C',
    units: [
      { id: 1, inletTemp: '36.9°C', outletTemp: '47.1°C' },
      { id: 2, inletTemp: '36.7°C', outletTemp: '47.3°C' },
      { id: 3, inletTemp: '36.6°C', outletTemp: '47.4°C' },
      { id: 4, inletTemp: '36.8°C', outletTemp: '47.0°C' },
      { id: 5, inletTemp: '36.5°C', outletTemp: '47.5°C' },
      { id: 6, inletTemp: '36.7°C', outletTemp: '47.2°C' }
    ],
    pumpCards: [
      {
        id: 1,
        title: '热泵1',
        data: {
          '进水温度': '46.5°C',
          '出水温度': '39.2°C',
          '环境温度': '23.8°C',
          '设备状态': '运行中',
          '故障状态': '正常'
        }
      },
      {
        id: 2,
        title: '热泵2',
        data: {
          '进水温度': '46.2°C',
          '出水温度': '39.5°C',
          '环境温度': '23.8°C',
          '设备状态': '运行中',
          '故障状态': '正常'
        }
      },
      {
        id: 7,
        title: '余热回收',
        data: {
          '瞬时流量': '132.8 m³/h',
          '瞬时流速': '3.1 m/s',
          '入口温度': '68.5°C',
          '出口温度': '45.2°C',
          '流量总量': '3458.9 m³',
          '热量总量': '3012.3 GJ',
          '节省费用': '¥168,950'
        }
      }
    ],
    powerTable: [
      { time: '2024-11-15 14:30:00', unit: '热泵1', power: '138.5 kWh', status: 1 },
      { time: '2024-11-15 14:25:00', unit: '热泵2', power: '125.3 kWh', status: 1 },
      { time: '2024-11-15 14:20:00', unit: '热泵3', power: '112.8 kWh', status: 2 },
      { time: '2024-11-15 14:15:00', unit: '热泵4', power: '145.2 kWh', status: 1 },
      { time: '2024-11-15 14:10:00', unit: '热泵5', power: '128.7 kWh', status: 3 },
      { time: '2024-11-15 14:05:00', unit: '热泵6', power: '98.3 kWh', status: 1 },
      { time: '2024-11-15 14:00:00', unit: '余热回收', power: '0 kWh', status: 1 }
    ]
  },
  dongdapeng: {
    totalInlet: { pressure: '0.43 MPa', flow: '98 m³/h', temp: '34.2°C' },
    totalOutlet: { pressure: '0.36 MPa', temp: '44.1°C' },
    ambientTemp: '14.8°C',
    units: [
      { id: 1, inletTemp: '34.3°C', outletTemp: '44.0°C' },
      { id: 2, inletTemp: '34.1°C', outletTemp: '44.2°C' },
      { id: 3, inletTemp: '34.4°C', outletTemp: '43.9°C' },
      { id: 4, inletTemp: '34.2°C', outletTemp: '44.1°C' },
      { id: 5, inletTemp: '34.0°C', outletTemp: '44.3°C' }
    ],
    pumpCards: [
      {
        id: 1,
        title: '热泵1',
        data: {
          '进水温度': '43.8°C',
          '出水温度': '37.2°C',
          '环境温度': '21.5°C',
          '设备状态': '运行中',
          '故障状态': '正常'
        }
      }
    ],
    powerTable: [
      { time: '2024-11-15 14:30:00', unit: '热泵1', power: '95.2 kWh', status: 1 },
      { time: '2024-11-15 14:25:00', unit: '热泵2', power: '88.7 kWh', status: 1 },
      { time: '2024-11-15 14:20:00', unit: '热泵3', power: '92.1 kWh', status: 2 },
      { time: '2024-11-15 14:15:00', unit: '热泵4', power: '103.5 kWh', status: 1 },
      { time: '2024-11-15 14:10:00', unit: '热泵5', power: '86.9 kWh', status: 3 }
    ]
  },
  yanfa: {
    totalInlet: { pressure: '0.50 MPa', flow: '112 m³/h', temp: '37.5°C' },
    totalOutlet: { pressure: '0.42 MPa', temp: '48.1°C' },
    ambientTemp: '16.2°C',
    units: [
      { id: 1, inletTemp: '37.6°C', outletTemp: '48.0°C' },
      { id: 2, inletTemp: '37.4°C', outletTemp: '48.2°C' },
      { id: 3, inletTemp: '37.5°C', outletTemp: '48.1°C' },
      { id: 4, inletTemp: '37.7°C', outletTemp: '47.9°C' }
    ],
    pumpCards: [
      {
        id: 1,
        title: '热泵1',
        data: {
          '进水温度': '47.2°C',
          '出水温度': '40.1°C',
          '环境温度': '24.2°C',
          '设备状态': '运行中',
          '故障状态': '正常'
        }
      }
    ],
    powerTable: [
      { time: '2024-11-15 14:30:00', unit: '热泵1', power: '156.8 kWh', status: 1 },
      { time: '2024-11-15 14:25:00', unit: '热泵2', power: '142.3 kWh', status: 2 },
      { time: '2024-11-15 14:20:00', unit: '热泵3', power: '148.9 kWh', status: 1 },
      { time: '2024-11-15 14:15:00', unit: '热泵4', power: '165.2 kWh', status: 3 }
    ]
  }
});`;
	
	console.log(realtimeExample);
	
	console.log('\n\n%c📈 方法2: 批量更新甘特图（三个画面一次性更新）', 'color: #2ed573; font-weight: bold; font-size: 14px');
	console.log('%c语法:', 'color: #ffa502; font-weight: bold');
	console.log('  updateGanttData(allGanttData)');
	console.log('\n%c参数说明:', 'color: #ffa502; font-weight: bold');
	console.log('  allGanttData: 包含三个面板甘特图数据的对象');
	
	console.log('\n%c════════════════════════════════════════════════════════', 'color: #4a90e2; font-weight: bold');
	console.log('%c💡 完整测试示例 - 直接复制下面代码到控制台执行', 'color: #e67e22; font-weight: bold; font-size: 13px');
	console.log('%c════════════════════════════════════════════════════════', 'color: #4a90e2; font-weight: bold');
	
	// 输出可执行的完整甘特图示例代码
	const ganttExample = `updateGanttData({
  daban: {
    devices: [
      {
        name: '热泵1',
        1: [['2024-11-15 08:00:00', '2024-11-15 12:00:00'], ['2024-11-15 14:00:00', '2024-11-15 18:00:00']],
        2: [],
        3: []
      },
      {
        name: '热泵2',
        1: [['2024-11-15 09:00:00', '2024-11-15 15:00:00']],
        2: [],
        3: []
      },
      {
        name: '热泵3',
        1: [['2024-11-15 08:00:00', '2024-11-15 12:00:00']],
        2: [['2024-11-15 13:00:00', '2024-11-15 13:30:00']],
        3: []
      },
      {
        name: '热泵4',
        1: [['2024-11-15 07:00:00', '2024-11-15 16:00:00']],
        2: [],
        3: []
      },
      {
        name: '热泵5',
        1: [['2024-11-15 08:30:00', '2024-11-15 17:00:00']],
        2: [],
        3: []
      },
      {
        name: '热泵6',
        1: [],
        2: [],
        3: [['2024-11-15 09:00:00', '2024-11-15 11:00:00']]
      },
      {
        name: '余热回收',
        1: [['2024-11-15 00:00:00', '2024-11-15 23:59:59']],
        2: [],
        3: []
      }
    ]
  },
  dongdapeng: {
    devices: [
      {
        name: '热泵1',
        1: [['2024-11-15 07:00:00', '2024-11-15 15:00:00']],
        2: [],
        3: []
      },
      {
        name: '热泵2',
        1: [['2024-11-15 08:00:00', '2024-11-15 16:00:00']],
        2: [],
        3: []
      },
      {
        name: '热泵3',
        1: [],
        2: [],
        3: [['2024-11-15 10:00:00', '2024-11-15 12:00:00']]
      },
      {
        name: '热泵4',
        1: [['2024-11-15 09:00:00', '2024-11-15 14:00:00']],
        2: [['2024-11-15 14:00:00', '2024-11-15 14:30:00']],
        3: []
      },
      {
        name: '热泵5',
        1: [],
        2: [],
        3: [['2024-11-15 11:00:00', '2024-11-15 13:00:00']]
      }
    ]
  },
  yanfa: {
    devices: [
      {
        name: '热泵1',
        1: [['2024-11-15 06:00:00', '2024-11-15 14:00:00']],
        2: [],
        3: []
      },
      {
        name: '热泵2',
        1: [['2024-11-15 07:00:00', '2024-11-15 15:00:00']],
        2: [],
        3: []
      },
      {
        name: '热泵3',
        1: [['2024-11-15 08:00:00', '2024-11-15 12:00:00']],
        2: [['2024-11-15 12:00:00', '2024-11-15 12:45:00']],
        3: []
      },
      {
        name: '热泵4',
        1: [['2024-11-15 09:00:00', '2024-11-15 17:00:00']],
        2: [],
        3: []
      }
    ]
  }
});`;
	
	console.log(ganttExample);
	
	console.log('\n%c════════════════════════════════════════════════════════', 'color: #4a90e2; font-weight: bold');
	console.log('%c💡 重要提示:', 'color: #e67e22; font-weight: bold');
	console.log('  1. ⚡ 两个方法都支持批量更新三个画面，也可以只更新部分画面');
	console.log('  2. 📝 可以只传入需要更新的字段，不需要传入所有数据');
	console.log('  3. 📋 上面的示例代码可以直接复制到控制台执行测试');
	console.log('\n%c  【实时数据字段说明】', 'color: #4a90e2; font-weight: bold');
	console.log('  🌡️  ambientTemp: 环境温度（显示在右上角区域）');
	console.log('  📊 totalInlet: 总进水数据（pressure, flow, temp）');
	console.log('  📊 totalOutlet: 总出水数据（pressure, temp）');
	console.log('  🔧 units: 各机组进出水温度数据');
	console.log('  📋 pumpCards: 鼠标悬浮弹窗数据');
	console.log('  ⚡ powerTable: 右下角电量表格数据');
	console.log('\n%c  【电量表格状态】', 'color: #4a90e2; font-weight: bold');
	console.log('  🎨 状态代码：1=运行(绿色), 2=故障(黄色), 3=停机(红色)');
	console.log('\n%c  【甘特图格式说明】', 'color: #4a90e2; font-weight: bold');
	console.log('  📊 每个设备包含：name(设备名)、1(运行)、2(故障)、3(停机)');
	console.log('  ⏰ 时间区间格式：[["开始时间", "结束时间"], ["开始时间", "结束时间"]]');
	console.log('  📅 时间格式：YYYY-MM-DD HH:mm:ss （例：2024-11-15 08:00:00）');
	console.log('  🎯 图例颜色：1=绿色(运行), 2=黄色(故障), 3=红色(停机)');
	console.log('  ✨ 示例：热泵1有两个运行时段，一个从8点到12点，一个从14点到18点');
	console.log('       { name: "热泵1", 1: [["2024-11-15 08:00:00", "2024-11-15 12:00:00"], ["2024-11-15 14:00:00", "2024-11-15 18:00:00"]] }');
	console.log('%c════════════════════════════════════════════════════════', 'color: #4a90e2; font-weight: bold');
	console.log('\n');
}

// ============================================
// 11. 真实数据接口（后期替换）
// ============================================
/**
 * 获取真实数据的示例代码：
 * 
 * function getRealData(systemType) {
 *     // 调用C++接口获取数据
 *     const jsonData = JsCallCppFunc('GetHeatPumpData', systemType);
 *     return JSON.parse(jsonData);
 * }
 * 
 * function startRealTimeUpdate() {
 *     setInterval(() => {
 *         const data = getRealData('daban');
 *         updateSystemData('daban', data);
 *     }, 5000); // 每5秒刷新一次
 * }
 */

