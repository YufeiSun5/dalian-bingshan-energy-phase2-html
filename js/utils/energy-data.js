// ================================
// 能源系统数据配置文件
// 此文件可直接修改，支持热重载
// ================================

const EnergyData = {
  "meters": [
    {
      "id": 1,
      "no": 1,
      "symbol": "E001",
      "name": "1#主变压器",
      "place": "3#变电所",
      "m_add": "1",
      "level": 1,
      "parent": null,
      "type": "主变压器"
    },
    {
      "id": 4,
      "no": 2,
      "symbol": "E002",
      "name": "变电所用电",
      "place": "3#变电所",
      "m_add": "2",
      "level": 2,
      "parent": "E001",
      "type": "用电"
    },
    {
      "id": 5,
      "no": 3,
      "symbol": "E003",
      "name": "污水处理装置",
      "place": "3#变电所",
      "m_add": "3",
      "level": 2,
      "parent": "E001",
      "type": "设备"
    },
    {
      "id": 6,
      "no": 4,
      "symbol": "E005",
      "name": "研发中心GCS柜",
      "place": "3#变电所",
      "m_add": "5",
      "level": 2,
      "parent": "E001",
      "type": "预留"
    },
    {
      "id": 7,
      "no": 5,
      "symbol": "E004",
      "name": "耐久实验室3#动力柜",
      "place": "3#变电所",
      "m_add": "4",
      "level": 2,
      "parent": "E001",
      "type": "实验室"
    },
    {
      "id": 8,
      "no": 6,
      "symbol": "E006",
      "name": "预留",
      "place": "3#变电所",
      "m_add": "6",
      "level": 2,
      "parent": "E001",
      "type": "配电柜"
    },
    {
      "id": 9,
      "no": 7,
      "symbol": "E007",
      "name": "研发大马力性能试验室",
      "place": "3#变电所",
      "m_add": "7",
      "level": 2,
      "parent": "E001",
      "type": "实验室"
    },
    {
      "id": 10,
      "no": 8,
      "symbol": "E008",
      "name": "耐久试验室2号柜",
      "place": "3#变电所",
      "m_add": "8",
      "level": 2,
      "parent": "E001",
      "type": "实验室"
    },
    {
      "id": 11,
      "no": 9,
      "symbol": "E009",
      "name": "耐久1#5#柜",
      "place": "3#变电所",
      "m_add": "9",
      "level": 2,
      "parent": "E001",
      "type": "实验室"
    },
    {
      "id": 2,
      "no": 10,
      "symbol": "E010",
      "name": "研发堵转试验左侧",
      "place": "3#变电所",
      "m_add": "10",
      "level": 2,
      "parent": "E001",
      "type": "实验室"
    },
    {
      "id": 3,
      "no": 11,
      "symbol": "E011",
      "name": "研发预留",
      "place": "3#变电所",
      "m_add": "11",
      "level": 2,
      "parent": "E001",
      "type": "预留"
    },
    {
      "id": 35,
      "no": 26,
      "symbol": "E012",
      "name": "2#主变压器",
      "place": "3#变电所",
      "m_add": "12",
      "level": 1,
      "parent": null,
      "type": "主变压器"
    },
    {
      "id": 42,
      "no": 310012,
      "symbol": "E310012",
      "name": "备用",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "备用"
    },
    {
      "id": 43,
      "no": 310013,
      "symbol": "E310013",
      "name": "备用",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "备用"
    },
    {
      "id": 44,
      "no": 320002,
      "symbol": "E320002",
      "name": "备用",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "备用"
    },
    {
      "id": 45,
      "no": 320003,
      "symbol": "E320003",
      "name": "备用",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "备用"
    },
    {
      "id": 46,
      "no": 320004,
      "symbol": "E320004",
      "name": "IT新机房",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "IT"
    },
    {
      "id": 47,
      "no": 320005,
      "symbol": "E320005",
      "name": "新成品",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "仓库"
    },
    {
      "id": 48,
      "no": 320006,
      "symbol": "E320006",
      "name": "备用",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "备用"
    },
    {
      "id": 49,
      "no": 320007,
      "symbol": "E320007",
      "name": "备用",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "备用"
    },
    {
      "id": 50,
      "no": 320008,
      "symbol": "E320008",
      "name": "热水炉",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "设备"
    },
    {
      "id": 51,
      "no": 320009,
      "symbol": "E320009",
      "name": "研发R290性能实验室",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "实验室"
    },
    {
      "id": 52,
      "no": 320010,
      "symbol": "E320010",
      "name": "焓差实验室",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "实验室"
    },
    {
      "id": 53,
      "no": 320011,
      "symbol": "E320011",
      "name": "备用",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "备用"
    },
    {
      "id": 54,
      "no": 320012,
      "symbol": "E320012",
      "name": "备用",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "备用"
    },
    {
      "id": 55,
      "no": 320013,
      "symbol": "E320013",
      "name": "25马力组装凸焊机",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "设备"
    },
    {
      "id": 56,
      "no": 320014,
      "symbol": "E320014",
      "name": "25马力组装线设备 1",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "生产线"
    },
    {
      "id": 57,
      "no": 320015,
      "symbol": "E320015",
      "name": "25马力组装线设备 2",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "生产线"
    },
    {
      "id": 58,
      "no": 320016,
      "symbol": "E320016",
      "name": "备用",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "备用"
    },
    {
      "id": 59,
      "no": 320017,
      "symbol": "E320017",
      "name": "寿力3高压柜",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "空压机"
    },
    {
      "id": 60,
      "no": 320018,
      "symbol": "E320018",
      "name": "耐久4#、8#、9#动力柜",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "实验室"
    },
    {
      "id": 61,
      "no": 320019,
      "symbol": "E320019",
      "name": "耐久6#动力柜",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "实验室"
    },
    {
      "id": 62,
      "no": 320020,
      "symbol": "E320020",
      "name": "耐久7#动力柜",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "实验室"
    },
    {
      "id": 63,
      "no": 320021,
      "symbol": "E320021",
      "name": "备用",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "备用"
    },
    {
      "id": 64,
      "no": 320022,
      "symbol": "E320022",
      "name": "B座大办冷水机组-左",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "空调"
    },
    {
      "id": 65,
      "no": 320023,
      "symbol": "E320023",
      "name": "备用",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "备用"
    },
    {
      "id": 66,
      "no": 320024,
      "symbol": "E320024",
      "name": "B座大办冷水机组 -右",
      "place": "3#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E012",
      "type": "空调"
    },
    {
      "id": 12,
      "no": 12,
      "symbol": "E021",
      "name": "1#主变压器",
      "place": "2#变电所",
      "m_add": "1",
      "level": 1,
      "parent": null,
      "type": "主变压器"
    },
    {
      "id": 13,
      "no": 13,
      "symbol": "E022",
      "name": "1#变机加GCS西",
      "place": "2#变电所",
      "m_add": "2",
      "level": 2,
      "parent": "E021",
      "type": "配电柜"
    },
    {
      "id": 14,
      "no": 14,
      "symbol": "E023",
      "name": "1#变机加GCS西#",
      "place": "2#变电所",
      "m_add": "3",
      "level": 2,
      "parent": "E021",
      "type": "配电柜"
    },
    {
      "id": 15,
      "no": 15,
      "symbol": "E024",
      "name": "2#变机加GCS东",
      "place": "2#变电所",
      "m_add": "4",
      "level": 2,
      "parent": "E021",
      "type": "配电柜"
    },
    {
      "id": 16,
      "no": 16,
      "symbol": "E025",
      "name": "2#主变压器",
      "place": "2#变电所",
      "m_add": "5",
      "level": 1,
      "parent": null,
      "type": "主变压器"
    },
    {
      "id": 17,
      "no": 17,
      "symbol": "E026",
      "name": "3#主变压器",
      "place": "2#变电所",
      "m_add": "6",
      "level": 1,
      "parent": null,
      "type": "主变压器"
    },
    {
      "id": 18,
      "no": 18,
      "symbol": "E027",
      "name": "3#冷水机组及退火炉",
      "place": "2#变电所",
      "m_add": "7",
      "level": 2,
      "parent": "E026",
      "type": "设备"
    },
    {
      "id": 19,
      "no": 19,
      "symbol": "E028",
      "name": "4#变新退火炉",
      "place": "2#变电所",
      "m_add": "8",
      "level": 2,
      "parent": "E026",
      "type": "设备"
    },
    {
      "id": 20,
      "no": 20,
      "symbol": "E029",
      "name": "4#主变压器",
      "place": "2#变电所",
      "m_add": "9",
      "level": 1,
      "parent": null,
      "type": "主变压器"
    },
    {
      "id": 67,
      "no": 210004,
      "symbol": "E210004",
      "name": "备用",
      "place": "2#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E021",
      "type": "备用"
    },
    {
      "id": 68,
      "no": 210005,
      "symbol": "E210005",
      "name": "备用",
      "place": "2#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E021",
      "type": "备用"
    },
    {
      "id": 69,
      "no": 220003,
      "symbol": "E220003",
      "name": "备用",
      "place": "2#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E025",
      "type": "备用"
    },
    {
      "id": 70,
      "no": 220004,
      "symbol": "E220004",
      "name": "新电机绕线供电",
      "place": "2#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E025",
      "type": "生产设备",
      "department": "电机课",
      "category": "生产用电",
      "unit": "定转子单元"
    },
    {
      "id": 71,
      "no": 220005,
      "symbol": "E220005",
      "name": "定转子设备",
      "place": "2#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E025",
      "type": "生产设备",
      "department": "电机课",
      "category": "生产用电",
      "unit": "定转子单元"
    },
    {
      "id": 120,
      "no": 220006,
      "symbol": "E220006",
      "name": "定转子照明",
      "place": "2#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E025",
      "type": "照明",
      "department": "电机课",
      "category": "辅助用电"
    },
    {
      "id": 72,
      "no": 230003,
      "symbol": "E230003",
      "name": "冰山帕特",
      "place": "2#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E026",
      "type": "空压机"
    },
    {
      "id": 73,
      "no": 230004,
      "symbol": "E230004",
      "name": "80KW实验室",
      "place": "2#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E026",
      "type": "实验室"
    },
    {
      "id": 74,
      "no": 230005,
      "symbol": "E230005",
      "name": "80KW实验室_1",
      "place": "2#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E026",
      "type": "实验室"
    },
    {
      "id": 75,
      "no": 230006,
      "symbol": "E230006",
      "name": "寿力2",
      "place": "2#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E026",
      "type": "空压机"
    },
    {
      "id": 76,
      "no": 230007,
      "symbol": "E230007",
      "name": "寿力4",
      "place": "2#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E026",
      "type": "空压机"
    },
    {
      "id": 77,
      "no": 230008,
      "symbol": "E230008",
      "name": "神钢2",
      "place": "2#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E026",
      "type": "空压机"
    },
    {
      "id": 121,
      "no": 230009,
      "symbol": "E230009",
      "name": "新碱清洗",
      "place": "2#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E026",
      "type": "生产设备"
    },
    {
      "id": 122,
      "no": 230010,
      "symbol": "E230010",
      "name": "新磷化",
      "place": "2#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E026",
      "type": "生产设备"
    },
    {
      "id": 78,
      "no": 240003,
      "symbol": "E240003",
      "name": "新壳体GCS柜",
      "place": "2#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E029",
      "type": "配电柜"
    },
    {
      "id": 79,
      "no": 240004,
      "symbol": "E240004",
      "name": "食堂电锅",
      "place": "2#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E029",
      "type": "食堂"
    },
    {
      "id": 80,
      "no": 240005,
      "symbol": "E240005",
      "name": "电机10",
      "place": "2#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E029",
      "type": "生产设备",
      "department": "电机课",
      "category": "辅助用电"
    },
    {
      "id": 81,
      "no": 240006,
      "symbol": "E240006",
      "name": "电机8",
      "place": "2#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E029",
      "type": "生产设备",
      "department": "电机课",
      "category": "辅助用电"
    },
    {
      "id": 123,
      "no": 240007,
      "symbol": "E240007",
      "name": "电机7",
      "place": "2#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E029",
      "type": "生产设备",
      "department": "电机课",
      "category": "辅助用电"
    },
    {
      "id": 124,
      "no": 240008,
      "symbol": "E240008",
      "name": "电机11",
      "place": "2#变电所",
      "m_add": null,
      "level": 3,
      "parent": "E029",
      "type": "生产设备",
      "department": "电机课",
      "category": "辅助用电"
    },
    {
      "id": 21,
      "no": 21,
      "symbol": "E041",
      "name": "电机实验室",
      "place": "研发变电所",
      "m_add": "1",
      "level": 1,
      "parent": null,
      "type": "实验室"
    },
    {
      "id": 22,
      "no": 22,
      "symbol": "E042",
      "name": "研发AP-1-6",
      "place": "研发变电所",
      "m_add": "2",
      "level": 1,
      "parent": null,
      "type": "配电"
    },
    {
      "id": 23,
      "no": 23,
      "symbol": "E043",
      "name": "研发AP-1-7",
      "place": "研发变电所",
      "m_add": "3",
      "level": 1,
      "parent": null,
      "type": "配电"
    },
    {
      "id": 24,
      "no": 24,
      "symbol": "E044",
      "name": "4#表",
      "place": "研发变电所",
      "m_add": "4",
      "level": 1,
      "parent": null,
      "type": "电表"
    },
    {
      "id": 25,
      "no": 25,
      "symbol": "E045",
      "name": "5#表",
      "place": "研发变电所",
      "m_add": "5",
      "level": 1,
      "parent": null,
      "type": "电表"
    },
    {
      "id": 36,
      "no": 51,
      "symbol": "E051",
      "name": "1#主变压器",
      "place": "1#变电所",
      "m_add": "1",
      "level": 1,
      "parent": null,
      "type": "主变压器"
    },
    {
      "id": 37,
      "no": 52,
      "symbol": "E052",
      "name": "2#主变压器",
      "place": "1#变电所",
      "m_add": "2",
      "level": 1,
      "parent": null,
      "type": "主变压器"
    },
    {
      "id": 99,
      "no": 110002,
      "symbol": "E110002",
      "name": "IT新机房",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E051",
      "type": "IT"
    },
    {
      "id": 100,
      "no": 110003,
      "symbol": "E110003",
      "name": "宿舍二、三楼",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E051",
      "type": "宿舍"
    },
    {
      "id": 101,
      "no": 110004,
      "symbol": "E110004",
      "name": "办公照明",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E051",
      "type": "照明"
    },
    {
      "id": 102,
      "no": 110005,
      "symbol": "E110005",
      "name": "研发消防系统",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E051",
      "type": "消防"
    },
    {
      "id": 103,
      "no": 110006,
      "symbol": "E110006",
      "name": "组装GCS",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E051",
      "type": "配电柜"
    },
    {
      "id": 104,
      "no": 110007,
      "symbol": "E110007",
      "name": "电机9号",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E051",
      "type": "生产设备"
    },
    {
      "id": 105,
      "no": 110008,
      "symbol": "E110008",
      "name": "M456",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E051",
      "type": "设备"
    },
    {
      "id": 106,
      "no": 110009,
      "symbol": "E110009",
      "name": "M123",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E051",
      "type": "设备"
    },
    {
      "id": 107,
      "no": 110010,
      "symbol": "E110010",
      "name": "备用",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E051",
      "type": "备用"
    },
    {
      "id": 108,
      "no": 110011,
      "symbol": "E110011",
      "name": "备用",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E051",
      "type": "备用"
    },
    {
      "id": 109,
      "no": 110012,
      "symbol": "E110012",
      "name": "组装31#",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E051",
      "type": "生产线"
    },
    {
      "id": 110,
      "no": 110013,
      "symbol": "E110013",
      "name": "组装照明",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E051",
      "type": "照明"
    },
    {
      "id": 82,
      "no": 120002,
      "symbol": "E120002",
      "name": "备用",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E052",
      "type": "备用"
    },
    {
      "id": 83,
      "no": 120003,
      "symbol": "E120003",
      "name": "备用",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E052",
      "type": "备用"
    },
    {
      "id": 84,
      "no": 120004,
      "symbol": "E120004",
      "name": "备用",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E052",
      "type": "备用"
    },
    {
      "id": 85,
      "no": 120005,
      "symbol": "E120005",
      "name": "神钢4#",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E052",
      "type": "空压机"
    },
    {
      "id": 86,
      "no": 120006,
      "symbol": "E120006",
      "name": "组装32#",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E052",
      "type": "生产线"
    },
    {
      "id": 87,
      "no": 120007,
      "symbol": "E120007",
      "name": "备用",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E052",
      "type": "备用"
    },
    {
      "id": 88,
      "no": 120008,
      "symbol": "E120008",
      "name": "空压机照明辅助",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E052",
      "type": "照明"
    },
    {
      "id": 89,
      "no": 120009,
      "symbol": "E120009",
      "name": "备用",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E052",
      "type": "备用"
    },
    {
      "id": 90,
      "no": 120010,
      "symbol": "E120010",
      "name": "神钢1#",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E052",
      "type": "空压机"
    },
    {
      "id": 91,
      "no": 120011,
      "symbol": "E120011",
      "name": "神钢3#",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E052",
      "type": "空压机"
    },
    {
      "id": 92,
      "no": 120012,
      "symbol": "E120012",
      "name": "备用",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E052",
      "type": "备用"
    },
    {
      "id": 93,
      "no": 120013,
      "symbol": "E120013",
      "name": "组装空调",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E052",
      "type": "空调"
    },
    {
      "id": 94,
      "no": 120014,
      "symbol": "E120014",
      "name": "R290风机",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E052",
      "type": "设备"
    },
    {
      "id": 95,
      "no": 120015,
      "symbol": "E120015",
      "name": "所内用电",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E052",
      "type": "用电"
    },
    {
      "id": 96,
      "no": 120016,
      "symbol": "E120016",
      "name": "CO2性能实验",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E052",
      "type": "实验室"
    },
    {
      "id": 97,
      "no": 120017,
      "symbol": "E120017",
      "name": "电机13#柜",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E052",
      "type": "配电柜"
    },
    {
      "id": 98,
      "no": 120018,
      "symbol": "E120018",
      "name": "备用",
      "place": "1#变电所",
      "m_add": null,
      "level": 2,
      "parent": "E052",
      "type": "备用"
    },
    {
      "id": 115,
      "no": 410001,
      "symbol": "E410001",
      "name": "寿力3",
      "place": "空压机房",
      "m_add": null,
      "level": 1,
      "parent": null,
      "type": "空压机"
    },
    {
      "id": 116,
      "no": 410002,
      "symbol": "E410002",
      "name": "寿力2",
      "place": "空压机房",
      "m_add": null,
      "level": 1,
      "parent": null,
      "type": "空压机"
    },
    {
      "id": 117,
      "no": 410003,
      "symbol": "E410003",
      "name": "寿力4",
      "place": "空压机房",
      "m_add": null,
      "level": 1,
      "parent": null,
      "type": "空压机"
    },
    {
      "id": 118,
      "no": 410004,
      "symbol": "E410004",
      "name": "神钢2",
      "place": "空压机房",
      "m_add": null,
      "level": 1,
      "parent": null,
      "type": "空压机"
    },
    {
      "id": 125,
      "no": 490001,
      "symbol": "E490001",
      "name": "组装一号表",
      "place": "大马力",
      "m_add": null,
      "level": 1,
      "parent": null,
      "type": "电表"
    },
    {
      "id": 126,
      "no": 490002,
      "symbol": "E490002",
      "name": "组装二号表",
      "place": "大马力",
      "m_add": null,
      "level": 1,
      "parent": null,
      "type": "电表"
    },
    {
      "id": 127,
      "no": 490003,
      "symbol": "E490003",
      "name": "前处理电表",
      "place": "大马力",
      "m_add": null,
      "level": 1,
      "parent": null,
      "type": "电表"
    },
    {
      "id": 128,
      "no": 490004,
      "symbol": "E490004",
      "name": "固化炉电表",
      "place": "大马力",
      "m_add": null,
      "level": 1,
      "parent": null,
      "type": "电表"
    },
    {
      "id": 129,
      "no": 490005,
      "symbol": "E490005",
      "name": "氢检线电表",
      "place": "大马力",
      "m_add": null,
      "level": 1,
      "parent": null,
      "type": "电表"
    },
    {
      "id": 130,
      "no": 490006,
      "symbol": "E490006",
      "name": "输送线电表一号表",
      "place": "大马力",
      "m_add": null,
      "level": 1,
      "parent": null,
      "type": "电表"
    },
    {
      "id": 131,
      "no": 490007,
      "symbol": "E490007",
      "name": "输送线电表二号表",
      "place": "大马力",
      "m_add": null,
      "level": 1,
      "parent": null,
      "type": "电表"
    },
    {
      "id": 132,
      "no": 490008,
      "symbol": "E490008",
      "name": "操作线电表一号表",
      "place": "大马力",
      "m_add": null,
      "level": 1,
      "parent": null,
      "type": "电表"
    },
    {
      "id": 133,
      "no": 490009,
      "symbol": "E490009",
      "name": "操作线电表二号表",
      "place": "大马力",
      "m_add": null,
      "level": 1,
      "parent": null,
      "type": "电表"
    },
    {
      "id": 134,
      "no": 510001,
      "symbol": "E510001",
      "name": "C性能实验室",
      "place": "第三层下属车间",
      "m_add": null,
      "level": 3,
      "parent": "E026",
      "type": "实验室"
    },
    {
      "id": 135,
      "no": 510002,
      "symbol": "E510002",
      "name": "410A实验室",
      "place": "第三层下属车间",
      "m_add": null,
      "level": 3,
      "parent": "E026",
      "type": "实验室"
    },
    {
      "id": 136,
      "no": 510003,
      "symbol": "E510003",
      "name": "线切割",
      "place": "第三层下属车间",
      "m_add": null,
      "level": 3,
      "parent": "E026",
      "type": "生产设备"
    },
    {
      "id": 137,
      "no": 510004,
      "symbol": "E510004",
      "name": "空压机水泵",
      "place": "第三层下属车间",
      "m_add": null,
      "level": 3,
      "parent": "E026",
      "type": "设备"
    },
    {
      "id": 138,
      "no": 520001,
      "symbol": "E520001",
      "name": "三坐标、检具室",
      "place": "第三层下属车间",
      "m_add": null,
      "level": 3,
      "parent": "E029",
      "type": "检测"
    },
    {
      "id": 139,
      "no": 520002,
      "symbol": "E520002",
      "name": "磷化2#加热管",
      "place": "第三层下属车间",
      "m_add": null,
      "level": 3,
      "parent": "E029",
      "type": "生产设备"
    },
    {
      "id": 140,
      "no": 520003,
      "symbol": "E520003",
      "name": "组装29",
      "place": "第三层下属车间",
      "m_add": null,
      "level": 3,
      "parent": "E029",
      "type": "生产线"
    },
    {
      "id": 141,
      "no": 520004,
      "symbol": "E520004",
      "name": "机加03-2",
      "place": "第三层下属车间",
      "m_add": null,
      "level": 3,
      "parent": "E029",
      "type": "生产设备"
    },
    {
      "id": 142,
      "no": 520005,
      "symbol": "E520005",
      "name": "机加03-2-1",
      "place": "第三层下属车间",
      "m_add": null,
      "level": 3,
      "parent": "E029",
      "type": "生产设备"
    },
    {
      "id": 143,
      "no": 520006,
      "symbol": "E520006",
      "name": "清洗加热管",
      "place": "第三层下属车间",
      "m_add": null,
      "level": 3,
      "parent": "E029",
      "type": "生产设备"
    },
    {
      "id": 144,
      "no": 520007,
      "symbol": "E520007",
      "name": "磷化1#加热管",
      "place": "第三层下属车间",
      "m_add": null,
      "level": 3,
      "parent": "E029",
      "type": "生产设备"
    },
    {
      "id": 145,
      "no": 520008,
      "symbol": "E520008",
      "name": "食堂",
      "place": "第三层下属车间",
      "m_add": null,
      "level": 3,
      "parent": "E029",
      "type": "食堂"
    },
    {
      "id": 146,
      "no": 520009,
      "symbol": "E520009",
      "name": "检测中心",
      "place": "第三层下属车间",
      "m_add": null,
      "level": 3,
      "parent": "E029",
      "type": "检测"
    },
    {
      "id": 147,
      "no": 520010,
      "symbol": "E520010",
      "name": "压铸24",
      "place": "第三层下属车间",
      "m_add": null,
      "level": 3,
      "parent": "E029",
      "type": "生产设备"
    },
    {
      "id": 148,
      "no": 520011,
      "symbol": "E520011",
      "name": "压铸25",
      "place": "第三层下属车间",
      "m_add": null,
      "level": 3,
      "parent": "E029",
      "type": "生产设备"
    },
    {
      "id": 149,
      "no": 520012,
      "symbol": "E520012",
      "name": "新电机15",
      "place": "第三层下属车间",
      "m_add": null,
      "level": 3,
      "parent": "E029",
      "type": "生产设备"
    },
    {
      "id": 150,
      "no": 520013,
      "symbol": "E520013",
      "name": "变电所空调",
      "place": "第三层下属车间",
      "m_add": null,
      "level": 3,
      "parent": "E029",
      "type": "空调"
    },
    {
      "id": 151,
      "no": 520014,
      "symbol": "E520014",
      "name": "变电所照明",
      "place": "第三层下属车间",
      "m_add": null,
      "level": 3,
      "parent": "E029",
      "type": "照明"
    },
    {
      "id": 152,
      "no": 530001,
      "symbol": "E530001",
      "name": "AP1-0二楼配电室总电柜",
      "place": "第三层下属车间",
      "m_add": null,
      "level": 3,
      "parent": "E029",
      "type": "配电柜"
    },
    {
      "id": 153,
      "no": 530002,
      "symbol": "E530002",
      "name": "AP3-0四楼配电室总电柜",
      "place": "第三层下属车间",
      "m_add": null,
      "level": 3,
      "parent": "E029",
      "type": "配电柜"
    }
  ],
  "departments": {
    "电机课": {
      "name": "电机课",
      "categories": {
        "生产用电": {
          "name": "生产用电",
          "units": {
            "定转子单元": {
              "name": "定转子单元",
              "symbols": [
                "E520010",
                "E520011",
                "E028",
                "E027"
              ]
            },
            "浸漆单元": {
              "name": "浸漆单元",
              "symbols": [
                "E110007",
                "E240007",
                "E240006",
                "E240005",
                "E240008"
              ]
            },
            "绕线A单元": {
              "name": "绕线A单元",
              "symbols": []
            },
            "绕线B单元": {
              "name": "绕线B单元",
              "symbols": [
                "E520012"
              ]
            }
          }
        },
        "辅助用电": {
          "name": "辅助用电",
          "symbols": []
        }
      }
    },
    "动力实施课": {
      "name": "动力实施课",
      "categories": {
        "生产用电": {
          "name": "生产用电",
          "units": {
            "空压机": {
              "name": "空压机",
              "symbols": [
                "E120010",
                "E120011",
                "E120005",
                "E120016",
                "E120008",
                "E230006",
                "E230007",
                "E320017",
                "E230008"
              ]
            },
            "污水处理区": {
              "name": "污水处理区",
              "symbols": [
                "E003"
              ]
            },
            "变电所": {
              "name": "变电所",
              "symbols": [
                "E120015",
                "E520013",
                "E520014",
                "E002"
              ]
            }
          }
        },
        "辅助用电": {
          "name": "辅助用电",
          "units": {
            "B座热泵": {
              "name": "B座热泵",
              "symbols": [
                "E320022",
                "E320024"
              ]
            },
            "B座办公": {
              "name": "B座办公",
              "symbols": []
            }
          }
        }
      }
    },
    "机加工课": {
      "name": "机加工课",
      "categories": {
        "生产用电": {
          "name": "生产用电",
          "equipments": {
            "十字环": {
              "name": "十字环",
              "symbols": []
            },
            "曲轴": {
              "name": "曲轴",
              "symbols": []
            },
            "B支撑": {
              "name": "B支撑",
              "symbols": []
            },
            "B定": {
              "name": "B定",
              "symbols": []
            },
            "B动": {
              "name": "B动",
              "symbols": []
            },
            "C定": {
              "name": "C定",
              "symbols": []
            },
            "C动": {
              "name": "C动",
              "symbols": []
            },
            "C支撑": {
              "name": "C支撑",
              "symbols": []
            },
            "新壳体": {
              "name": "新壳体",
              "symbols": []
            }
          }
        },
        "辅助用电": {
          "name": "辅助用电",
          "symbols": []
        }
      }
    },
    "经营企划本部": {
      "name": "经营企划本部",
      "categories": {
        "本部": {
          "name": "本部",
          "equipments": {
            "IT新机房": {
              "name": "IT新机房",
              "symbols": [
                "E320004",
                "E110002"
              ]
            },
            "旧宿舍照明（物业办公区）": {
              "name": "旧宿舍照明（物业办公区）",
              "symbols": [
                "E110003"
              ]
            },
            "二楼研发报告厅、喷泉AP1-6": {
              "name": "二楼研发报告厅、喷泉AP1-6",
              "symbols": []
            },
            "会客室[C座办公楼（小黄楼）]": {
              "name": "会客室[C座办公楼（小黄楼）]",
              "symbols": []
            },
            "四楼办公区域用电": {
              "name": "四楼办公区域用电",
              "symbols": []
            },
            "A座冷水机组AP5-2": {
              "name": "A座冷水机组AP5-2",
              "symbols": []
            },
            "A座冷水机组AP5-3": {
              "name": "A座冷水机组AP5-3",
              "symbols": []
            }
          }
        },
        "食堂": {
          "name": "食堂",
          "equipments": {
            "食堂": {
              "name": "食堂",
              "symbols": [
                "E520008",
                "E240004"
              ]
            }
          }
        }
      }
    },
    "开发本部": {
      "name": "开发本部",
      "categories": {
        "本部": {
          "name": "本部",
          "units": {
            "A座大楼（研发）": {
              "name": "A座大楼（研发）",
              "symbols": [
                "E006",
                "E230004",
                "E230005",
                "E007",
                "E010",
                "E320010",
                "E320009"
              ]
            },
            "耐久实验室": {
              "name": "耐久实验室",
              "symbols": [
                "E005",
                "E008",
                "E009",
                "E320018",
                "E320019",
                "E320020"
              ]
            },
            "A座大楼热泵机组（研发）": {
              "name": "A座大楼热泵机组（研发）",
              "symbols": []
            }
          }
        },
        "备用": {
          "name": "备用",
          "symbols": []
        }
      }
    },
    "品质本部": {
      "name": "品质本部",
      "categories": {
        "本部": {
          "name": "本部",
          "equipments": {
            "B系列实验室16-1": {
              "name": "B系列实验室16-1",
              "symbols": []
            },
            "B系列实验室16-2": {
              "name": "B系列实验室16-2",
              "symbols": []
            },
            "委托实验室品质本部（耐久）": {
              "name": "委托实验室品质本部（耐久）",
              "symbols": []
            },
            "C系列实验室": {
              "name": "C系列实验室",
              "symbols": [
                "E510001"
              ]
            },
            "410实验室": {
              "name": "410实验室",
              "symbols": [
                "E510002"
              ]
            },
            "机加13（三坐标）": {
              "name": "机加13（三坐标）",
              "symbols": []
            },
            "检测中心": {
              "name": "检测中心",
              "symbols": [
                "E520009"
              ]
            },
            "线切割": {
              "name": "线切割",
              "symbols": [
                "E510003"
              ]
            },
            "委托实验室品质本部（大马力性能）": {
              "name": "委托实验室品质本部（大马力性能）",
              "symbols": []
            }
          }
        },
        "备用": {
          "name": "备用",
          "symbols": []
        }
      }
    },
    "营业本部": {
      "name": "营业本部",
      "categories": {
        "本部": {
          "name": "本部",
          "equipments": {
            "原办公室精修（ISP）": {
              "name": "原办公室精修（ISP）",
              "symbols": [
                "E110004"
              ]
            },
            "电机二楼库区20（ISP）": {
              "name": "电机二楼库区20（ISP）",
              "symbols": []
            },
            "东大棚照明（ISP）": {
              "name": "东大棚照明（ISP）",
              "symbols": []
            },
            "北大棚照明（ISP）": {
              "name": "北大棚照明（ISP）",
              "symbols": []
            },
            "委托焓差实验室营业本部": {
              "name": "委托焓差实验室营业本部",
              "symbols": []
            }
          }
        },
        "备用": {
          "name": "备用",
          "symbols": []
        }
      }
    },
    "组装二课": {
      "name": "组装二课",
      "categories": {
        "生产用电": {
          "name": "生产用电",
          "equipments": {
            "新成品GCS柜": {
              "name": "新成品GCS柜",
              "symbols": [
                "E320005"
              ]
            },
            "新成品热水炉": {
              "name": "新成品热水炉",
              "symbols": [
                "E320008"
              ]
            },
            "25马力组装凸焊机": {
              "name": "25马力组装凸焊机",
              "symbols": [
                "E320013"
              ]
            },
            "25马力组装1#柜": {
              "name": "25马力组装1#柜",
              "symbols": [
                "E320014"
              ]
            },
            "25马力组装2#柜": {
              "name": "25马力组装2#柜",
              "symbols": [
                "E320015"
              ]
            }
          }
        },
        "辅助用电": {
          "name": "辅助用电",
          "symbols": []
        }
      }
    },
    "组装一课": {
      "name": "组装一课",
      "categories": {
        "生产用电": {
          "name": "生产用电",
          "equipments": {
            "C组装": {
              "name": "C组装",
              "symbols": []
            },
            "CS": {
              "name": "CS",
              "symbols": []
            },
            "TIG": {
              "name": "TIG",
              "symbols": []
            },
            "成品": {
              "name": "成品",
              "symbols": []
            },
            "清洗": {
              "name": "清洗",
              "symbols": [
                "E230009"
              ]
            },
            "磷化": {
              "name": "磷化",
              "symbols": [
                "E230010"
              ]
            }
          }
        },
        "辅助用电": {
          "name": "辅助用电",
          "symbols": []
        }
      }
    }
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnergyData;
}
