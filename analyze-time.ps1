# Анализ времени работы по коммитам
$commits = git log --format="%ad" --date=iso --reverse

$dates = @()
foreach ($line in $commits) {
    try {
        $date = [DateTime]::Parse($line)
        $dates += $date.Date
    } catch {
        # Пропускаем некорректные даты
    }
}

$uniqueDays = $dates | Sort-Object -Unique
$workDays = $uniqueDays | Sort-Object

Write-Host "=== АНАЛИЗ ВРЕМЕНИ РАБОТЫ ===" -ForegroundColor Green
Write-Host ""

# Первый и последний день
$firstDay = $workDays[0]
$lastDay = $workDays[-1]
$totalPeriod = ($lastDay - $firstDay).TotalDays

Write-Host "Первый коммит: $($firstDay.ToString('yyyy-MM-dd'))"
Write-Host "Последний коммит: $($lastDay.ToString('yyyy-MM-dd'))"
Write-Host "Общий период: $([math]::Round($totalPeriod)) дней"
Write-Host ""

# Анализ пауз
Write-Host "=== АНАЛИЗ ПАУЗ ===" -ForegroundColor Yellow
$pauses = @()
for ($i = 1; $i -lt $workDays.Count; $i++) {
    $diff = ($workDays[$i] - $workDays[$i-1]).TotalDays
    if ($diff -gt 1) {
        $pauses += [PSCustomObject]@{
            From = $workDays[$i-1]
            To = $workDays[$i]
            Days = [math]::Round($diff)
        }
    }
}

if ($pauses.Count -gt 0) {
    Write-Host "Найдено пауз: $($pauses.Count)"
    foreach ($pause in $pauses) {
        Write-Host "  Пауза: $($pause.From.ToString('yyyy-MM-dd')) -> $($pause.To.ToString('yyyy-MM-dd')) ($($pause.Days) дней)"
    }
} else {
    Write-Host "Пауз не обнаружено"
}
Write-Host ""

# Рабочие дни
Write-Host "=== СТАТИСТИКА РАБОТЫ ===" -ForegroundColor Cyan
$actualWorkDays = $workDays.Count
Write-Host "Всего дней с коммитами: $actualWorkDays"

# Группировка по месяцам
$byMonth = $workDays | Group-Object { $_.ToString('yyyy-MM') } | Sort-Object Name
Write-Host ""
Write-Host "Работа по месяцам:"
foreach ($month in $byMonth) {
    Write-Host "  $($month.Name): $($month.Count) дней"
}

# Подсчет времени
$estimatedHours = $actualWorkDays * 8  # Предполагаем 8 часов в день
$estimatedHoursConservative = $actualWorkDays * 6  # Консервативная оценка 6 часов

Write-Host ""
Write-Host "=== ОЦЕНКА ВРЕМЕНИ ===" -ForegroundColor Magenta
Write-Host "Оценка часов (8ч/день): $estimatedHours часов ($([math]::Round($estimatedHours / 8)) рабочих дней)"
Write-Host "Оценка часов (6ч/день): $estimatedHoursConservative часов ($([math]::Round($estimatedHoursConservative / 8)) рабочих дней)"
