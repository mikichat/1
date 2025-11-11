# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 Project Overview

This is a Korean travel guide generation system (골프여행/일반여행 안내문 생성기) that creates professional travel brochures for golf trips and general travel. The system is a web-based application with Python backend and vanilla JavaScript frontend.

## 🚀 Development Commands

Always respond in korea.
The development environment is Windows.
파일 수정 후에는 git에 변경 사항을 (add,commit) 후 push 합니다.
"모든 코드 생성 시 스타일의 주석을 반드시 포함하라"
답변은 단순하게 (요점만) 하시오.
git 사용시는 코드 수정 사항은 보고 하지말고 수정하라.

### Starting the Development Environment
```bash
# Start both Tailwind watcher and Python server
start.bat

# Or manually start components:
npx @tailwindcss/cli -i ./css/input.css -o ./css/output.css --watch
python server.py
```

### Build Commands
```bash
# Build Tailwind CSS
npx @tailwindcss/cli -i ./css/input.css -o ./css/output.css

# No additional build step required - static HTML + Python backend
```

### Testing
```bash
# No test framework configured
# Manual testing through browser at http://localhost:8000
```

## 🏗️ Architecture Overview

### Frontend Structure
- **Static HTML**: Separate pages for different travel types
  - `golf/golf-advanced.html` - Golf travel form (fully functional)
  - `travel/travel-advanced.html` - General travel form (in development)
  - `golf/preview.html` & `travel/preview.html` - Preview pages
- **Excel Integration**: `excel/` directory contains Excel import/export functionality
- **Styling**: Tailwind CSS + custom fonts in `fonts/custom-fonts.css`

### Backend (server.py)
- **Python HTTP Server**: Simple server on port 8000
- **SQLite Database**: `database.db` stores trips and templates
- **API Endpoints**:
  - `GET/POST /api/trips` - Save/load travel guides
  - `GET/POST /api/templates` - Save/load design templates

### Data Flow
1. **Input**: Users fill forms or import Excel files
2. **Processing**: JavaScript validates and structures data
3. **Storage**: Data compressed with LZ-String for localStorage/URL sharing
4. **Backend Storage**: SQLite for persistent storage
5. **Preview**: Dedicated preview pages with print functionality

### Key Technologies
- **Frontend**: Vanilla JavaScript, Tailwind CSS, Quill.js (rich text), html2canvas (image export)
- **Backend**: Python 3, SQLite, http.server
- **Data**: LZ-String compression, SheetJS (Excel), Base64 image encoding

## 🎨 Styling & Design System

### Font System (fonts/custom-fonts.css)
- 8 Korean fonts including Pretendard, SB Aggro, Noto Sans KR
- Custom font loading via @font-face declarations

### Color Customization
- Dynamic color picker system for headers, titles, sections
- Gradient backgrounds with linear-gradient utilities
- Theme-aware color variables in JavaScript

### Responsive Design
- Tailwind CSS responsive utilities
- Mobile-optimized forms and previews
- Print-specific CSS for travel brochures

## 💾 Data Management

### Data Structure (Golf Trip Example)
```javascript
{
  title: "여행제목",
  startDate: "YYYY-MM-DD",
  endDate: "YYYY-MM-DD",
  airportMeeting: { place, date, time, name, phone, image, include },
  localMeeting: { place, date, time, guide, phone, image, include },
  teeTimes: [{ courseName, date, time, holes, greenFee, caddyFee, cartFee, image, includePreview }],
  schedules: [{ date, title, detail, meals, image, includePreview }],
  // ... accommodation, flights, company info
}
```

### Storage Methods
1. **localStorage**: Client-side temporary storage
2. **SQLite Database**: Server-side persistent storage via API
3. **URL Compression**: LZ-String for shareable links
4. **Excel Import/Export**: SheetJS for data exchange

## 🔧 Development Guidelines

### Code Style
- **HTML**: Semantic markup with Tailwind classes
- **JavaScript**: Vanilla JS, ES6+ features, modular functions
- **Python**: PEP 8 style, type hints recommended
- **Comments**: Korean comments for business logic

### File Organization
- Keep travel type logic separate (golf/, travel/)
- Shared assets in root-level directories (css/, js/, fonts/)
- Excel functionality isolated in excel/ directory

### Data Validation
- Client-side validation in JavaScript
- Date format standardization (YYYY-MM-DD)
- Image size limits and Base64 encoding
- Required field validation before preview

## 🚨 Important Notes

### Development Environment
- **Platform**: Windows (start.bat for convenience)
- **Language**: Korean for UI and comments
- **Git Workflow**: Auto-commit after changes (add, commit, push)
- **Deployment**: Static files + Python server

### Browser Support
- Modern browsers with ES6+ support
- Local storage and File API required
- Print media queries for brochure output

### Data Security
- No sensitive data collection
- Local storage for user privacy
- Optional server storage for persistence