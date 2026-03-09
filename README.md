# 冰山松阳能源二期 HTML 项目 / 氷山松陽エネルギー第2期 HTML プロジェクト / Bingshan Songyang Energy Phase 2 HTML Project

---

## 目录 / 目次 / Table of Contents

- [中文](#中文)
- [日本語](#日本語)
- [English](#english)

---

<a name="中文"></a>
# 中文

## 项目介绍

本项目是**冰山松阳能源二期**的前端可视化管理系统，面向工厂能源管理人员，提供能源数据的实时监控、统计分析、报表生成及异常告警等功能。系统涵盖电能、气量、水量、污水处理、热泵、变压器温度、空压机等多个能源子系统，支持以桌面应用（C++ 后台）或浏览器的方式运行。

## 主要特性

- 📊 **实时数据监控**：各能源系统实时数据展示，支持折线图、柱状图、热力图等多种图表
- 📈 **统计分析**：日、月、年同比/环比趋势分析，各区域及部门用能占比统计
- 🗂️ **多维度报表**：支持按时间、区域、设备等维度生成明细报表，并可导出为 Excel
- 🚨 **故障报警**：实时故障告警历史查询及统计分析
- 🏭 **驾驶舱大屏**：管理层决策支持的综合能源看板
- 🔒 **用户管理**：登录认证与权限分配
- 🌡️ **变压器温度监控**：温度实时采集与异常预警
- 💨 **空压机管理**：甘特图排班与运行参数监控
- 🔥 **可燃气体安全监控**：可燃气体浓度实时监测
- 📝 **数据录入**：支持手动录入缺失数据

## 项目结构

```
dalian-bingshan-energy-phase2-html/
├── js/                         # 公共 JS 库及工具
│   ├── echarts.js              # ECharts 图表库
│   ├── layui.js                # LayUI UI 框架
│   ├── xlsx.full.min.js        # Excel 处理库
│   ├── d3.v7.min.js            # D3.js 可视化库
│   ├── decimal.js              # 高精度数字处理
│   ├── xm-select.js            # 下拉选择组件
│   ├── JsCallCppFunc.js        # JS 调用 C++ 接口（桌面端）
│   ├── CppCallJsFunc.js        # C++ 调用 JS 接口（桌面端）
│   └── utils/                  # 工具模块
│       ├── energy-config-v2.js # 能源配置
│       ├── energy-data.js      # 能源数据定义
│       ├── energy-manager.js   # 能源管理工具
│       └── decimal-formatter.js# 数字格式化
├── 登录/                       # 登录与用户管理
├── 菜单/                       # 导航菜单
├── 电能相关/                   # 电能监控与分析（35+ 页面）
├── 空压机房相关/               # 空压机管理
├── 气量相关/                   # 气量监控
├── 水量相关/                   # 水量监控
├── 污水处理相关/               # 污水处理监控
├── 热泵系统相关/               # 热泵系统分析
├── 变压器温度/                 # 变压器温度监控
├── 故障报警/                   # 故障告警系统
├── 总统计相关/                 # 综合统计报表（20+ 页面）
├── 驾驶舱/                     # 管理驾驶舱大屏（8 个页面）
├── 组装空调相关/               # 组装线空调监控
├── 可燃气体相关/               # 可燃气体安全监控
├── 数据录入部分/               # 数据手动录入
├── 敬请期待/                   # 功能开发中
├── meter-assignment-tool.html  # 电表分配工具
└── README.md
```

## 快速开始

### 前提条件

- 现代浏览器（Chrome 80+、Edge 80+、Firefox 75+）
- （桌面端）配套 C++ 后台程序
- （可选）MySQL 数据库（默认连接地址：`192.168.7.229:3306`，数据库名：`sy`）

### 安装与启动

**方式一：直接用浏览器打开（静态预览）**

```bash
# 1. 克隆仓库
git clone https://github.com/YufeiSun5/dalian-bingshan-energy-phase2-html.git

# 2. 进入项目目录
cd dalian-bingshan-energy-phase2-html

# 3. 用浏览器打开入口页面（以 VS Code Live Server 为例）
# 安装 VS Code 插件 "Live Server"，右键 登录/登录.html -> Open with Live Server
```

**方式二：配合桌面端 C++ 应用**

```bash
# 1. 克隆仓库至指定路径
git clone https://github.com/YufeiSun5/dalian-bingshan-energy-phase2-html.git

# 2. 在 C++ 应用配置文件中指定前端路径，启动应用即可
```

## 技术栈

| 类别 | 技术/库 | 说明 |
|------|---------|------|
| 前端语言 | HTML5 + JavaScript (ES6) | 原生开发，无框架依赖 |
| UI 框架 | [LayUI](https://layui.dev/) | 表单、表格、弹窗等 UI 组件 |
| 图表库 | [ECharts](https://echarts.apache.org/) | 折线、柱状、饼图等各类图表 |
| 可视化 | [D3.js v7](https://d3js.org/) | 复杂数据可视化 |
| Excel 导出 | [SheetJS (xlsx)](https://sheetjs.com/) | 报表导出 Excel |
| 数字精度 | [Decimal.js](https://mikemcl.github.io/decimal.js/) | 高精度数值运算 |
| 图标 | FontAwesome + 自定义 iconfont | 图标资源 |
| 桌面集成 | C++/JS 双向通信桥 | 桌面应用 IPC 通信 |
| 数据库 | MySQL | 后端数据存储 |

## 核心模块说明

| 模块 | 目录 | 主要功能 |
|------|------|----------|
| 电能管理 | `电能相关/` | 实时电能曲线、统计明细、同比/环比分析、峰谷分析、各区域占比 |
| 空压机房 | `空压机房相关/` | 高/低压线图、气量比、甘特图排班、运行曲线 |
| 气量管理 | `气量相关/` | 气量曲线、统计报表、同比/环比分析 |
| 水量管理 | `水量相关/` | 水量统计、分布分析 |
| 污水处理 | `污水处理相关/` | 日处理水量、COD/TP/TN 数据监控 |
| 热泵系统 | `热泵系统相关/` | 效率分析、运行参数监控 |
| 变压器温度 | `变压器温度/` | 实时温度采集、告警阈值管理 |
| 故障报警 | `故障报警/` | 告警历史查询、统计分析 |
| 综合统计 | `总统计相关/` | 工厂整体能耗分析、月度报表 |
| 驾驶舱 | `驾驶舱/` | 管理层 KPI 综合看板（电、气、水等） |
| 可燃气体 | `可燃气体相关/` | 安全浓度实时监测 |
| 数据录入 | `数据录入部分/` | 手动补录数据 |
| 用户管理 | `登录/` | 登录认证、用户管理、权限分配 |

## 配置说明

- **数据库连接**：在 `.vscode/settings.json` 中配置 MySQL 连接信息（仅用于 VS Code 数据库插件）
- **能源配置**：在 `js/utils/energy-config-v2.js` 中配置电表、部门、能源类别等映射关系
- **C++ 接口**：`js/JsCallCppFunc.js` 定义 JS 调用桌面端 C++ 方法的接口，`js/CppCallJsFunc.js` 定义 C++ 回调 JS 的接口

## 许可证

本项目为商业项目，版权归大连冰山松阳能源有限公司所有，未经授权不得复制或分发。

## 联系方式

如有问题，请通过 GitHub Issues 联系项目维护团队。

---

<a name="日本語"></a>
# 日本語

## プロジェクト紹介

本プロジェクトは**氷山松陽エネルギー第2期**のフロントエンド可視化管理システムです。工場のエネルギー管理者向けに、リアルタイムデータ監視、統計分析、レポート生成、異常アラートなどの機能を提供します。電力、ガス、水量、排水処理、ヒートポンプ、変圧器温度、空気圧縮機など複数のエネルギーサブシステムをカバーしており、デスクトップアプリケーション（C++ バックエンド）またはブラウザとして動作します。

## 主な機能

- 📊 **リアルタイムデータ監視**：各エネルギーシステムのリアルタイムデータ表示（折れ線グラフ、棒グラフ、ヒートマップなど）
- 📈 **統計分析**：日・月・年の前年比/前期比トレンド分析、エリア・部門別エネルギー消費比較
- 🗂️ **多次元レポート**：時間・エリア・設備などの軸で詳細レポートを生成、Excel エクスポート対応
- 🚨 **故障アラート**：リアルタイム異常アラートの履歴照会および統計分析
- 🏭 **ダッシュボード大画面**：経営層向け意思決定支援の統合エネルギーダッシュボード
- 🔒 **ユーザー管理**：ログイン認証と権限割り当て
- 🌡️ **変圧器温度監視**：温度リアルタイム収集と異常警告
- 💨 **空気圧縮機管理**：ガントチャートによるスケジューリングと稼働パラメータ監視
- 🔥 **可燃性ガス安全監視**：可燃性ガス濃度のリアルタイム監視
- 📝 **データ入力**：欠損データの手動入力対応

## プロジェクト構造

```
dalian-bingshan-energy-phase2-html/
├── js/                         # 共通 JS ライブラリ＆ユーティリティ
│   ├── echarts.js              # ECharts グラフライブラリ
│   ├── layui.js                # LayUI UI フレームワーク
│   ├── xlsx.full.min.js        # Excel 処理ライブラリ
│   ├── d3.v7.min.js            # D3.js 可視化ライブラリ
│   ├── decimal.js              # 高精度数値処理
│   ├── xm-select.js            # セレクトコンポーネント
│   ├── JsCallCppFunc.js        # JS から C++ 呼び出し（デスクトップ用）
│   ├── CppCallJsFunc.js        # C++ から JS コールバック（デスクトップ用）
│   └── utils/                  # ユーティリティモジュール
│       ├── energy-config-v2.js # エネルギー設定
│       ├── energy-data.js      # エネルギーデータ定義
│       ├── energy-manager.js   # エネルギー管理ユーティリティ
│       └── decimal-formatter.js# 数値フォーマット
├── 登录/                       # ログイン・ユーザー管理
├── 菜单/                       # ナビゲーションメニュー
├── 电能相关/                   # 電力監視・分析（35以上のページ）
├── 空压机房相关/               # 空気圧縮機管理
├── 气量相关/                   # ガス量監視
├── 水量相关/                   # 水量監視
├── 污水处理相关/               # 排水処理監視
├── 热泵系统相关/               # ヒートポンプシステム分析
├── 変圧器温度/                 # 変圧器温度監視
├── 故障报警/                   # 故障アラートシステム
├── 总统计相关/                 # 総合統計レポート（20以上のページ）
├── 驾驶舱/                     # 経営管理ダッシュボード（8 ページ）
├── 组装空调相关/               # 組立ライン空調監視
├── 可燃气体相关/               # 可燃性ガス安全監視
├── 数据录入部分/               # データ手動入力
├── 敬请期待/                   # 開発中機能
├── meter-assignment-tool.html  # 電力メーター割り当てツール
└── README.md
```

## クイックスタートガイド

### 前提条件

- 最新ブラウザ（Chrome 80+、Edge 80+、Firefox 75+）
- （デスクトップ版）対応する C++ バックエンドプログラム
- （任意）MySQL データベース（デフォルト接続先：`192.168.7.229:3306`、DB名：`sy`）

### インストールと起動

**方法1：ブラウザで直接開く（静的プレビュー）**

```bash
# 1. リポジトリをクローン
git clone https://github.com/YufeiSun5/dalian-bingshan-energy-phase2-html.git

# 2. プロジェクトディレクトリに移動
cd dalian-bingshan-energy-phase2-html

# 3. VS Code の "Live Server" 拡張機能で 登录/登录.html を右クリック
#    -> [Open with Live Server] を選択
```

**方法2：C++ デスクトップアプリと連携**

```bash
# 1. 指定パスにリポジトリをクローン
git clone https://github.com/YufeiSun5/dalian-bingshan-energy-phase2-html.git

# 2. C++ アプリの設定ファイルにフロントエンドパスを指定してアプリを起動
```

## 技術スタック

| カテゴリ | 技術/ライブラリ | 説明 |
|----------|----------------|------|
| フロントエンド言語 | HTML5 + JavaScript (ES6) | フレームワーク非依存のネイティブ開発 |
| UI フレームワーク | [LayUI](https://layui.dev/) | フォーム・テーブル・ダイアログ等 |
| グラフライブラリ | [ECharts](https://echarts.apache.org/) | 折れ線・棒・円グラフ等 |
| データ可視化 | [D3.js v7](https://d3js.org/) | 複雑なデータ可視化 |
| Excel エクスポート | [SheetJS (xlsx)](https://sheetjs.com/) | レポートの Excel 出力 |
| 数値精度 | [Decimal.js](https://mikemcl.github.io/decimal.js/) | 高精度数値演算 |
| アイコン | FontAwesome + カスタム iconfont | アイコンリソース |
| デスクトップ統合 | C++/JS 双方向通信ブリッジ | デスクトップアプリ IPC 通信 |
| データベース | MySQL | バックエンドデータ保存 |

## コアモジュール

| モジュール | ディレクトリ | 主な機能 |
|-----------|------------|----------|
| 電力管理 | `电能相关/` | リアルタイム電力曲線、統計明細、前年比/前期比分析、ピーク・オフピーク分析 |
| 空気圧縮機室 | `空压机房相关/` | 高・低圧線図、ガス比、ガントチャートスケジューリング、稼働曲線 |
| ガス量管理 | `气量相关/` | ガス量曲線、統計レポート、前年比/前期比分析 |
| 水量管理 | `水量相关/` | 水量統計、分布分析 |
| 排水処理 | `污水处理相关/` | 日処理水量、COD/TP/TN データ監視 |
| ヒートポンプ | `热泵系统相关/` | 効率分析、稼働パラメータ監視 |
| 変圧器温度 | `变压器温度/` | リアルタイム温度収集、アラートしきい値管理 |
| 故障アラート | `故障报警/` | アラート履歴照会、統計分析 |
| 総合統計 | `总统计相关/` | 工場全体エネルギー消費分析、月次レポート |
| ダッシュボード | `驾驶舱/` | 経営層向け KPI 統合ダッシュボード（電・ガス・水等） |
| 可燃性ガス | `可燃气体相关/` | 安全濃度リアルタイム監視 |
| データ入力 | `数据录入部分/` | 欠損データの手動補完 |
| ユーザー管理 | `登录/` | ログイン認証、ユーザー管理、権限割り当て |

## 設定情報

- **データベース接続**：`.vscode/settings.json` で MySQL 接続情報を設定（VS Code データベースプラグイン用）
- **エネルギー設定**：`js/utils/energy-config-v2.js` で電力メーター・部門・エネルギーカテゴリなどのマッピングを設定
- **C++ インターフェース**：`js/JsCallCppFunc.js` は JS からデスクトップ C++ メソッドを呼び出すインターフェース、`js/CppCallJsFunc.js` は C++ から JS へのコールバックインターフェースを定義

## ライセンス

本プロジェクトは商用プロジェクトであり、著作権は大連氷山松陽エネルギー有限公司に帰属します。無断複製・配布を禁じます。

## 連絡先

お問い合わせは GitHub Issues よりプロジェクトメンテナンスチームにご連絡ください。

---

<a name="english"></a>
# English

## Project Introduction

This project is the front-end visualization management system for **Bingshan Songyang Energy Phase 2**. It provides energy management personnel with real-time monitoring, statistical analysis, report generation, and anomaly alerting across multiple energy subsystems including electricity, gas, water, wastewater treatment, heat pumps, transformer temperature, and air compressors. The system can run as a desktop application (with a C++ backend) or in a standard web browser.

## Key Features

- 📊 **Real-time Data Monitoring**: Live dashboards for all energy subsystems with line charts, bar charts, heatmaps, and more
- 📈 **Statistical Analysis**: Daily, monthly, and yearly year-over-year / period-over-period trend analysis; energy consumption breakdown by area and department
- 🗂️ **Multi-dimensional Reports**: Detailed reports by time, area, or equipment; Excel export supported
- 🚨 **Fault Alarms**: Real-time fault alert history query and statistical analysis
- 🏭 **Executive Dashboard**: Comprehensive energy KPI dashboard for management decision support
- 🔒 **User Management**: Login authentication and role-based permission assignment
- 🌡️ **Transformer Temperature Monitoring**: Real-time temperature collection and anomaly alerts
- 💨 **Air Compressor Management**: Gantt chart scheduling and operational parameter monitoring
- 🔥 **Combustible Gas Safety Monitoring**: Real-time combustible gas concentration monitoring
- 📝 **Data Entry**: Manual entry support for missing or offline data

## Project Structure

```
dalian-bingshan-energy-phase2-html/
├── js/                         # Shared JS libraries & utilities
│   ├── echarts.js              # ECharts charting library
│   ├── layui.js                # LayUI UI framework
│   ├── xlsx.full.min.js        # Excel processing library
│   ├── d3.v7.min.js            # D3.js visualization library
│   ├── decimal.js              # High-precision number handling
│   ├── xm-select.js            # Select component library
│   ├── JsCallCppFunc.js        # JS-to-C++ bridge (desktop)
│   ├── CppCallJsFunc.js        # C++-to-JS callback bridge (desktop)
│   └── utils/                  # Utility modules
│       ├── energy-config-v2.js # Energy system configuration
│       ├── energy-data.js      # Energy data definitions
│       ├── energy-manager.js   # Energy management utilities
│       └── decimal-formatter.js# Decimal formatting utilities
├── 登录/                       # Login & user management
├── 菜单/                       # Navigation menu
├── 电能相关/                   # Electricity monitoring & analysis (35+ pages)
├── 空压机房相关/               # Air compressor room management
├── 气量相关/                   # Gas consumption monitoring
├── 水量相关/                   # Water consumption monitoring
├── 污水处理相关/               # Wastewater treatment monitoring
├── 热泵系统相关/               # Heat pump system analysis
├── 变压器温度/                 # Transformer temperature monitoring
├── 故障报警/                   # Fault alarm system
├── 总统计相关/                 # Overall statistics & reports (20+ pages)
├── 驾驶舱/                     # Executive dashboards (8 pages)
├── 组装空调相关/               # Assembly line air conditioning monitoring
├── 可燃气体相关/               # Combustible gas safety monitoring
├── 数据录入部分/               # Manual data entry
├── 敬请期待/                   # Features coming soon
├── meter-assignment-tool.html  # Energy meter assignment tool
└── README.md
```

## Quick Start Guide

### Prerequisites

- Modern browser (Chrome 80+, Edge 80+, Firefox 75+)
- (Desktop mode) Companion C++ backend application
- (Optional) MySQL database (default: `192.168.7.229:3306`, database: `sy`)

### Installation & Startup

**Option 1: Open directly in browser (static preview)**

```bash
# 1. Clone the repository
git clone https://github.com/YufeiSun5/dalian-bingshan-energy-phase2-html.git

# 2. Navigate to the project directory
cd dalian-bingshan-energy-phase2-html

# 3. Open the entry page in your browser
#    Install VS Code extension "Live Server", then right-click 登录/登录.html
#    and select "Open with Live Server"
```

**Option 2: Run with the C++ desktop application**

```bash
# 1. Clone the repository to the designated path
git clone https://github.com/YufeiSun5/dalian-bingshan-energy-phase2-html.git

# 2. Set the frontend path in the C++ application's config file and launch the app
```

## Technology Stack

| Category | Technology / Library | Description |
|----------|---------------------|-------------|
| Frontend Language | HTML5 + JavaScript (ES6) | Native development, no framework dependency |
| UI Framework | [LayUI](https://layui.dev/) | Forms, tables, dialogs, and other UI components |
| Charting Library | [ECharts](https://echarts.apache.org/) | Line, bar, pie charts, and more |
| Data Visualization | [D3.js v7](https://d3js.org/) | Complex data visualization |
| Excel Export | [SheetJS (xlsx)](https://sheetjs.com/) | Report Excel export |
| Number Precision | [Decimal.js](https://mikemcl.github.io/decimal.js/) | High-precision arithmetic |
| Icons | FontAwesome + custom iconfont | Icon resources |
| Desktop Integration | C++/JS bidirectional communication bridge | Desktop app IPC communication |
| Database | MySQL | Backend data storage |

## Core Modules

| Module | Directory | Key Features |
|--------|-----------|-------------|
| Electricity Management | `电能相关/` | Real-time power curves, detailed statistics, YoY/MoM analysis, peak-valley analysis, area breakdown |
| Air Compressor Room | `空压机房相关/` | High/low-pressure diagrams, gas ratio, Gantt scheduling, operation curves |
| Gas Consumption | `气量相关/` | Gas volume curves, statistical reports, YoY/MoM analysis |
| Water Consumption | `水量相关/` | Water statistics, distribution analysis |
| Wastewater Treatment | `污水处理相关/` | Daily treatment volume, COD/TP/TN data monitoring |
| Heat Pump System | `热泵系统相关/` | Efficiency analysis, operational parameter monitoring |
| Transformer Temperature | `变压器温度/` | Real-time temperature collection, alert threshold management |
| Fault Alarms | `故障报警/` | Alert history query, statistical analysis |
| Overall Statistics | `总统计相关/` | Factory-wide energy consumption analysis, monthly reports |
| Executive Dashboard | `驾驶舱/` | Management KPI dashboard (electricity, gas, water, etc.) |
| Combustible Gas | `可燃气体相关/` | Real-time safety concentration monitoring |
| Data Entry | `数据录入部分/` | Manual data backfill |
| User Management | `登录/` | Login authentication, user management, permission assignment |

## Configuration

- **Database Connection**: Configure MySQL connection details in `.vscode/settings.json` (used by the VS Code database plugin)
- **Energy Configuration**: Configure meter mappings, departments, and energy category definitions in `js/utils/energy-config-v2.js`
- **C++ Interface**: `js/JsCallCppFunc.js` defines the interface for JS to call desktop C++ methods; `js/CppCallJsFunc.js` defines the C++ callback interface into JS

## License

This is a commercial project. All rights reserved by Dalian Bingshan Songyang Energy Co., Ltd. Unauthorized copying or distribution is prohibited.

## Contact Information

For questions or issues, please contact the project maintenance team via GitHub Issues.