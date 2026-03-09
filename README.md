# 冰山松洋能源二期 HTML 管理系统 | Bingshan Songyang Energy Phase 2 HTML | 氷山松陽エネルギー第2期HTMLシステム

---

<div align="center">

![HTML](https://img.shields.io/badge/HTML-73.1%25-orange)
![JavaScript](https://img.shields.io/badge/JavaScript-22.1%25-yellow)
![CSS](https://img.shields.io/badge/CSS-4.8%25-blue)

</div>

---

## 目录 / Table of Contents / 目次

- [中文](#中文)
- [日本語](#日本語)
- [English](#english)

---

# 中文

## 项目介绍

**冰山松洋能源二期 HTML 管理系统** 是大连冰山能源有限公司为其松洋工厂二期项目开发的综合能源管理可视化平台。系统以 HTML/JavaScript/CSS 为核心技术栈，与底层 C++ 桌面应用程序进行双向通信，实现对工厂各类能源介质的实时采集、监控、统计与分析。

## 项目目的

- 集中展示工厂能耗数据，提升能源利用效率
- 为运维人员提供直观的实时监控界面
- 支持多维度的能源数据统计与报表导出
- 提供故障报警与设备状态可视化管理

## 主要特性

- **实时数据监控**：电能、水量、气量、变压器温度、热泵系统、空压机房等多类能源介质的实时数据展示
- **可视化图表**：集成 ECharts 与 D3.js，提供折线图、柱状图、热点图、树形图等多种图表类型
- **故障报警系统**：实时展示设备故障与告警信息，支持历史查询
- **驾驶舱总览**：综合驾驶舱界面，汇总全厂关键能耗指标
- **数据录入**：支持手动录入能源相关数据，兼容 Excel 导出
- **电表分配工具**：内置电表分配管理工具，支持计量点配置
- **尖峰平谷分析**：支持电费尖峰平谷时段的用电量分析与预览
- **污水处理监控**：污水处理系统运行状态监控
- **C++/桌面集成**：通过 `JsCallCppFunc.js` 和 `CppCallJsFunc.js` 实现与宿主 C++ 应用的双向通信
- **可扩展架构**：模块化文件结构，便于新功能扩展与维护

## 项目结构

```
dalian-bingshan-energy-phase2-html/
├── js/                          # 公共 JavaScript 库与工具
│   ├── echarts.js               # ECharts 图表库
│   ├── d3.v7.min.js             # D3.js 可视化库
│   ├── layui.js                 # Layui UI 框架
│   ├── decimal.js               # 高精度小数计算库
│   ├── xlsx.full.min.js         # Excel 导出库
│   ├── xm-select.js             # 下拉选择组件
│   ├── JsCallCppFunc.js         # JS 调用 C++ 接口
│   ├── CppCallJsFunc.js         # C++ 调用 JS 接口
│   ├── layui_exts/excel.js      # Layui Excel 扩展
│   ├── font/font/iconfont.js    # 图标字体
│   └── utils/
│       ├── energy-data.js       # 能源数据工具
│       ├── energy-config-v2.js  # 能源配置模块
│       ├── energy-manager.js    # 能源管理工具
│       └── decimal-formatter.js # 小数格式化工具
├── 实时数据/                    # 实时数据监控页面
├── 电能相关/                    # 电能监控与统计页面
├── 水量相关/                    # 水量监控页面
├── 气量相关/                    # 气量监控页面
├── 变压器温度/                  # 变压器温度监控
├── 热泵系统相关/                # 热泵系统监控
├── 空压机房相关/                # 空压机房监控
├── 组装空调相关/                # 组装空调系统监控
├── 可燃气体相关/                # 可燃气体监控
├── 污水处理相关/                # 污水处理系统监控
├── 总统计相关/                  # 综合统计报表
├── 故障报警/                    # 故障报警页面
├── 驾驶舱/                      # 总览驾驶舱
├── 数据录入部分/                # 数据录入界面
├── 菜单/                        # 导航菜单
├── 登录/                        # 登录页面
├── 敬请期待/                    # 待开发功能占位
├── meter-assignment-tool.html   # 电表分配工具
├── 尖峰平谷预览.html             # 尖峰平谷分析
├── 各区域用电量及占比统计12月统计.html  # 区域用电统计
├── 热点图.html                  # 热点图展示
├── 二层表头查询demo.html         # 二层表头查询示例
├── 树形图结合查询demo.html       # 树形图查询示例
└── README.md                    # 项目说明文档
```

## 快速开始

### 环境要求

- 现代浏览器（Chrome 80+、Firefox 80+、Edge 80+ 或同等版本）
- 若需完整功能，需配合对应的 C++ 宿主桌面应用程序运行

### 克隆仓库

```bash
git clone https://github.com/YufeiSun5/dalian-bingshan-energy-phase2-html.git
cd dalian-bingshan-energy-phase2-html
```

### 启动方式

**方式一：直接用浏览器打开**

直接双击任意 `.html` 文件，用浏览器打开即可预览页面。

**方式二：使用本地静态服务器**

```bash
# 使用 Python 启动静态服务器
python3 -m http.server 8080

# 或使用 Node.js 的 http-server
npx http-server -p 8080
```

然后在浏览器中访问：`http://localhost:8080`

**方式三：嵌入 C++ 宿主应用**

将本仓库部署为 C++ 桌面应用的前端资源目录，通过 WebView 组件加载，即可获得完整的双向通信能力。

## 技术栈

| 技术 | 版本/说明 | 用途 |
|------|-----------|------|
| HTML | HTML5 (73.1%) | 页面结构 |
| JavaScript | ES6+ (22.1%) | 交互逻辑 |
| CSS | CSS3 (4.8%) | 样式布局 |
| ECharts | 最新版 | 数据可视化图表 |
| D3.js | v7 | 高级数据可视化 |
| Layui | 最新版 | UI 组件框架 |
| decimal.js | 最新版 | 高精度数值计算 |
| xlsx.js | 最新版 | Excel 导出功能 |

## 核心模块说明

### 实时数据模块
位于 `实时数据/` 目录，负责实时展示各类能源介质的当前状态数据，数据由 C++ 后台推送。

### 电能相关模块
位于 `电能相关/` 目录，提供电能消耗的详细统计、趋势分析及各区域用电量对比功能。

### 驾驶舱模块
位于 `驾驶舱/` 目录，是系统的总览界面，汇总全厂关键能耗 KPI，采用大屏可视化设计。

### 故障报警模块
位于 `故障报警/` 目录，实时展示设备告警信息，支持按时间、设备类型等条件查询。

### 数据录入模块
位于 `数据录入部分/` 目录，提供人工录入能源数据的表单界面，支持 Excel 导出。

### JS-C++ 通信模块
- `js/JsCallCppFunc.js`：封装 JavaScript 调用 C++ 宿主函数的接口
- `js/CppCallJsFunc.js`：处理 C++ 宿主回调 JavaScript 函数的逻辑

## 配置说明

### 能源配置
编辑 `js/utils/energy-config-v2.js` 可调整：
- 各能源介质的计量单位
- 数据采集点位配置
- 图表显示参数

### 电表分配
使用 `meter-assignment-tool.html` 工具进行计量电表的分配与管理，支持在线配置。

## 许可证

本项目为大连冰山能源有限公司内部项目，版权归公司所有。未经授权，不得用于商业用途或对外发布。

## 联系方式与支持

- **项目归属**：大连冰山能源有限公司 冰山松洋工厂
- **仓库地址**：[https://github.com/YufeiSun5/dalian-bingshan-energy-phase2-html](https://github.com/YufeiSun5/dalian-bingshan-energy-phase2-html)
- **技术支持**：如遇问题请在 GitHub Issues 中提交

---

# 日本語

## プロジェクト紹介

**氷山松陽エネルギー第2期 HTML 管理システム**は、大連氷山エネルギー有限公司が松陽工場の第2期プロジェクト向けに開発した、総合エネルギー管理可視化プラットフォームです。HTML/JavaScript/CSS をコア技術スタックとして採用し、基盤となる C++ デスクトップアプリケーションと双方向通信を行うことで、工場のさまざまなエネルギー媒体のリアルタイム収集・監視・統計・分析を実現します。

## プロジェクトの目的

- 工場のエネルギー消費データを一元的に表示し、エネルギー利用効率を向上させる
- 運用・保守担当者に直感的なリアルタイム監視インターフェースを提供する
- 多次元エネルギーデータの統計とレポートエクスポートをサポートする
- 障害アラートと設備状態の可視化管理を実現する

## 主な機能

- **リアルタイムデータ監視**：電力、水量、ガス量、変圧器温度、ヒートポンプシステム、コンプレッサー室などのリアルタイムデータ表示
- **可視化チャート**：ECharts および D3.js を統合し、折れ線グラフ、棒グラフ、ヒートマップ、ツリーマップなど多様なチャートタイプを提供
- **障害アラートシステム**：設備の障害および警告情報をリアルタイム表示し、履歴照会をサポート
- **コックピット総覧**：工場全体の主要エネルギー消費指標を集約した総合ダッシュボード
- **データ入力**：エネルギー関連データの手動入力をサポートし、Excel エクスポートに対応
- **電力メーター割当ツール**：電力メーター割当管理ツールを内蔵し、計測点設定をサポート
- **ピーク・オフピーク分析**：電気料金のピーク・オフピーク時間帯における電力消費量の分析とプレビューをサポート
- **排水処理監視**：排水処理システムの稼働状態監視
- **C++/デスクトップ統合**：`JsCallCppFunc.js` および `CppCallJsFunc.js` を通じてホスト C++ アプリケーションとの双方向通信を実現
- **拡張可能なアーキテクチャ**：モジュール化されたファイル構造により、新機能の追加とメンテナンスが容易

## プロジェクト構造

```
dalian-bingshan-energy-phase2-html/
├── js/                          # 共通 JavaScript ライブラリとユーティリティ
│   ├── echarts.js               # ECharts グラフライブラリ
│   ├── d3.v7.min.js             # D3.js 可視化ライブラリ
│   ├── layui.js                 # Layui UI フレームワーク
│   ├── decimal.js               # 高精度小数計算ライブラリ
│   ├── xlsx.full.min.js         # Excel エクスポートライブラリ
│   ├── xm-select.js             # ドロップダウン選択コンポーネント
│   ├── JsCallCppFunc.js         # JS から C++ インターフェースの呼び出し
│   ├── CppCallJsFunc.js         # C++ から JS インターフェースの呼び出し
│   ├── layui_exts/excel.js      # Layui Excel 拡張
│   ├── font/font/iconfont.js    # アイコンフォント
│   └── utils/
│       ├── energy-data.js       # エネルギーデータユーティリティ
│       ├── energy-config-v2.js  # エネルギー設定モジュール
│       ├── energy-manager.js    # エネルギー管理ユーティリティ
│       └── decimal-formatter.js # 小数フォーマットツール
├── 实时数据/                    # リアルタイムデータ監視ページ
├── 电能相关/                    # 電力監視・統計ページ
├── 水量相关/                    # 水量監視ページ
├── 气量相关/                    # ガス量監視ページ
├── 变压器温度/                  # 変圧器温度監視
├── 热泵系统相关/                # ヒートポンプシステム監視
├── 空压机房相关/                # コンプレッサー室監視
├── 组装空调相关/                # 組立エアコンシステム監視
├── 可燃气体相关/                # 可燃性ガス監視
├── 污水处理相关/                # 排水処理システム監視
├── 总统计相关/                  # 総合統計レポート
├── 故障报警/                    # 障害アラートページ
├── 驾驶舱/                      # 総覧ダッシュボード
├── 数据录入部分/                # データ入力インターフェース
├── 菜单/                        # ナビゲーションメニュー
├── 登录/                        # ログインページ
├── 敬请期待/                    # 開発予定機能プレースホルダー
├── meter-assignment-tool.html   # 電力メーター割当ツール
├── 尖峰平谷预览.html             # ピーク・オフピーク分析
├── 各区域用电量及占比统计12月统计.html  # 地域別電力消費統計
├── 热点图.html                  # ヒートマップ表示
└── README.md                    # プロジェクト説明ドキュメント
```

## クイックスタート

### 動作環境

- モダンブラウザ（Chrome 80+、Firefox 80+、Edge 80+ または同等バージョン）
- 完全な機能を利用するには、対応する C++ ホストデスクトップアプリケーションとの連携が必要

### リポジトリのクローン

```bash
git clone https://github.com/YufeiSun5/dalian-bingshan-energy-phase2-html.git
cd dalian-bingshan-energy-phase2-html
```

### 起動方法

**方法1：ブラウザで直接開く**

任意の `.html` ファイルをダブルクリックし、ブラウザで開いてページをプレビューできます。

**方法2：ローカル静的サーバーを使用**

```bash
# Python で静的サーバーを起動
python3 -m http.server 8080

# または Node.js の http-server を使用
npx http-server -p 8080
```

ブラウザで `http://localhost:8080` にアクセスしてください。

**方法3：C++ ホストアプリケーションへの組み込み**

本リポジトリを C++ デスクトップアプリケーションのフロントエンドリソースディレクトリとしてデプロイし、WebView コンポーネントから読み込むことで、完全な双方向通信機能が利用可能になります。

## 技術スタック

| 技術 | バージョン/説明 | 用途 |
|------|----------------|------|
| HTML | HTML5 (73.1%) | ページ構造 |
| JavaScript | ES6+ (22.1%) | インタラクションロジック |
| CSS | CSS3 (4.8%) | スタイルとレイアウト |
| ECharts | 最新版 | データ可視化チャート |
| D3.js | v7 | 高度なデータ可視化 |
| Layui | 最新版 | UI コンポーネントフレームワーク |
| decimal.js | 最新版 | 高精度数値計算 |
| xlsx.js | 最新版 | Excel エクスポート機能 |

## コアモジュール説明

### リアルタイムデータモジュール
`実時数据/` ディレクトリに配置。C++ バックエンドからプッシュされたデータを使用して、各種エネルギー媒体の現在の状態データをリアルタイムで表示します。

### 電力関連モジュール
`電能相関/` ディレクトリに配置。電力消費の詳細な統計、トレンド分析、地域別電力消費比較機能を提供します。

### コックピットモジュール
`コックピット/` ディレクトリに配置。工場全体の主要エネルギー消費 KPI を集約したシステムの総覧画面で、大画面可視化デザインを採用しています。

### 障害アラートモジュール
`障害アラート/` ディレクトリに配置。設備のアラート情報をリアルタイム表示し、日時や設備タイプなどの条件による照会をサポートします。

### データ入力モジュール
`データ入力部分/` ディレクトリに配置。エネルギーデータを手動入力するフォームインターフェースを提供し、Excel エクスポートをサポートします。

### JS-C++ 通信モジュール
- `js/JsCallCppFunc.js`：JavaScript から C++ ホスト関数を呼び出すインターフェースをカプセル化
- `js/CppCallJsFunc.js`：C++ ホストが JavaScript 関数にコールバックするロジックを処理

## 設定説明

### エネルギー設定
`js/utils/energy-config-v2.js` を編集することで以下を調整できます：
- 各エネルギー媒体の計量単位
- データ収集ポイントの設定
- チャート表示パラメータ

### 電力メーター割当
`meter-assignment-tool.html` ツールを使用して、電力メーターの割当と管理を行います。オンライン設定をサポートしています。

## ライセンス

本プロジェクトは大連氷山エネルギー有限公司の内部プロジェクトであり、著作権は同社に帰属します。許可なく商業目的での使用または外部への公開はできません。

## 連絡先とサポート

- **プロジェクト所属**：大連氷山エネルギー有限公司 氷山松陽工場
- **リポジトリ URL**：[https://github.com/YufeiSun5/dalian-bingshan-energy-phase2-html](https://github.com/YufeiSun5/dalian-bingshan-energy-phase2-html)
- **技術サポート**：問題が発生した場合は GitHub Issues に提出してください

---

# English

## Project Introduction

**Bingshan Songyang Energy Phase 2 HTML Management System** is a comprehensive energy management and visualization platform developed by Dalian Bingshan Energy Co., Ltd. for its Songyang factory Phase 2 project. Built on an HTML/JavaScript/CSS technology stack, it communicates bidirectionally with an underlying C++ desktop application to achieve real-time collection, monitoring, statistical analysis, and reporting of various energy media across the factory.

## Project Purpose

- Centralize the display of factory energy consumption data to improve energy efficiency
- Provide operations and maintenance personnel with an intuitive real-time monitoring interface
- Support multi-dimensional energy data statistics and report export
- Enable fault alerting and equipment status visualization management

## Key Features

- **Real-Time Data Monitoring**: Live display of electrical energy, water flow, gas volume, transformer temperatures, heat pump systems, air compressor rooms, and more
- **Visualization Charts**: Integration of ECharts and D3.js, providing line charts, bar charts, heat maps, tree maps, and other chart types
- **Fault Alert System**: Real-time display of equipment faults and alert information with historical query support
- **Cockpit Dashboard**: Comprehensive dashboard aggregating key energy KPIs across the entire factory
- **Data Entry**: Supports manual entry of energy-related data with Excel export capability
- **Meter Assignment Tool**: Built-in electricity meter assignment and management tool with measurement point configuration
- **Peak/Off-Peak Analysis**: Analysis and preview of electricity consumption by peak, shoulder, and off-peak pricing periods
- **Wastewater Treatment Monitoring**: Operational status monitoring for the wastewater treatment system
- **C++/Desktop Integration**: Bidirectional communication with the host C++ application via `JsCallCppFunc.js` and `CppCallJsFunc.js`
- **Scalable Architecture**: Modular file structure for easy feature extension and maintenance

## Project Structure

```
dalian-bingshan-energy-phase2-html/
├── js/                          # Shared JavaScript libraries and utilities
│   ├── echarts.js               # ECharts chart library
│   ├── d3.v7.min.js             # D3.js visualization library
│   ├── layui.js                 # Layui UI framework
│   ├── decimal.js               # High-precision decimal arithmetic library
│   ├── xlsx.full.min.js         # Excel export library
│   ├── xm-select.js             # Dropdown select component
│   ├── JsCallCppFunc.js         # JavaScript-to-C++ interface calls
│   ├── CppCallJsFunc.js         # C++-to-JavaScript callback handling
│   ├── layui_exts/excel.js      # Layui Excel extension
│   ├── font/font/iconfont.js    # Icon font
│   └── utils/
│       ├── energy-data.js       # Energy data utilities
│       ├── energy-config-v2.js  # Energy configuration module
│       ├── energy-manager.js    # Energy management utilities
│       └── decimal-formatter.js # Decimal formatting tool
├── 实时数据/                    # Real-time data monitoring pages
├── 电能相关/                    # Electrical energy monitoring & statistics pages
├── 水量相关/                    # Water volume monitoring pages
├── 气量相关/                    # Gas volume monitoring pages
├── 变压器温度/                  # Transformer temperature monitoring
├── 热泵系统相关/                # Heat pump system monitoring
├── 空压机房相关/                # Air compressor room monitoring
├── 组装空调相关/                # Assembled AC system monitoring
├── 可燃气体相关/                # Flammable gas monitoring
├── 污水处理相关/                # Wastewater treatment system monitoring
├── 总统计相关/                  # Comprehensive statistics reports
├── 故障报警/                    # Fault alert pages
├── 驾驶舱/                      # Overview cockpit dashboard
├── 数据录入部分/                # Data entry interface
├── 菜单/                        # Navigation menu
├── 登录/                        # Login page
├── 敬请期待/                    # Coming-soon placeholder
├── meter-assignment-tool.html   # Meter assignment tool
├── 尖峰平谷预览.html             # Peak/off-peak analysis
├── 各区域用电量及占比统计12月统计.html  # Regional electricity usage statistics
├── 热点图.html                  # Heat map display
├── 二层表头查询demo.html         # Two-layer header query demo
├── 树形图结合查询demo.html       # Tree chart combined query demo
└── README.md                    # Project documentation
```

## Quick Start

### Prerequisites

- A modern browser (Chrome 80+, Firefox 80+, Edge 80+, or equivalent)
- For full functionality, a compatible C++ host desktop application is required

### Clone the Repository

```bash
git clone https://github.com/YufeiSun5/dalian-bingshan-energy-phase2-html.git
cd dalian-bingshan-energy-phase2-html
```

### Running the Project

**Option 1: Open directly in a browser**

Double-click any `.html` file to open and preview it in your browser.

**Option 2: Use a local static server**

```bash
# Start a static server with Python
python3 -m http.server 8080

# Or use Node.js http-server
npx http-server -p 8080
```

Then open your browser and navigate to: `http://localhost:8080`

**Option 3: Embed in a C++ host application**

Deploy this repository as the frontend resource directory for a C++ desktop application. Load it via a WebView component to enable full bidirectional communication capabilities.

## Technology Stack

| Technology | Version / Notes | Purpose |
|------------|-----------------|---------|
| HTML | HTML5 (73.1%) | Page structure |
| JavaScript | ES6+ (22.1%) | Interaction logic |
| CSS | CSS3 (4.8%) | Styling and layout |
| ECharts | Latest | Data visualization charts |
| D3.js | v7 | Advanced data visualization |
| Layui | Latest | UI component framework |
| decimal.js | Latest | High-precision numeric computation |
| xlsx.js | Latest | Excel export functionality |

## Core Modules

### Real-Time Data Module
Located in the `实时数据/` directory. Displays the current state of various energy media in real time, with data pushed from the C++ backend.

### Electrical Energy Module
Located in the `电能相关/` directory. Provides detailed statistics on power consumption, trend analysis, and regional electricity usage comparisons.

### Cockpit Module
Located in the `驾驶舱/` directory. Serves as the system's overview screen, aggregating key energy KPIs across the entire factory with a large-screen visualization design.

### Fault Alert Module
Located in the `故障报警/` directory. Displays equipment alert information in real time, supporting queries by time, equipment type, and other criteria.

### Data Entry Module
Located in the `数据录入部分/` directory. Provides a form-based interface for manually entering energy data, with Excel export support.

### JS-C++ Communication Module
- `js/JsCallCppFunc.js`: Encapsulates the interface for JavaScript to call C++ host functions
- `js/CppCallJsFunc.js`: Handles the logic for the C++ host to callback JavaScript functions

## Configuration

### Energy Configuration
Edit `js/utils/energy-config-v2.js` to adjust:
- Measurement units for each energy medium
- Data acquisition point configurations
- Chart display parameters

### Meter Assignment
Use the `meter-assignment-tool.html` tool to manage electricity meter assignments and configure measurement points online.

## License

This project is an internal project of Dalian Bingshan Energy Co., Ltd. All rights reserved by the company. Unauthorized commercial use or external distribution is prohibited.

## Contact and Support

- **Project Owner**: Dalian Bingshan Energy Co., Ltd. — Bingshan Songyang Factory
- **Repository**: [https://github.com/YufeiSun5/dalian-bingshan-energy-phase2-html](https://github.com/YufeiSun5/dalian-bingshan-energy-phase2-html)
- **Technical Support**: Please submit issues via GitHub Issues