import { supabase } from './supabaseClient';

/**
 * Fetch baseline spatial & field metadata with seasonal rollups
 */
export async function getSeasonalSummaries(season = '2017/2018', region = null) {
  let query = supabase
    .from('vw_seasonal_summary')
    .select('*')
    .eq('season_label', season);

  if (region) {
    query = query.eq('region', region);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching seasonal summaries:', error);
    return [];
  }
  return data;
}

/**
 * Fetch multi-year monthly time-series for a single selected field (for line charts)
 */
export async function getFieldTimeSeries(fieldId) {
  const { data, error } = await supabase
    .from('monthly_metrics')
    .select('log_month, ndvi, evi, ndwi, total_rain, avg_temp')
    .eq('field_id', fieldId)
    .order('log_month', { ascending: true });

  if (error) {
    console.error(`Error fetching time series for field ${fieldId}:`, error);
    return [];
  }
  return data;
}

/**
 * Fetch regional benchmark summaries for constituency comparison cards
 */
export async function getRegionalBenchmarks(season = '2017/2018') {
  const { data, error } = await supabase
    .from('vw_regional_benchmarks')
    .select('*')
    .eq('season_label', season);

  if (error) {
    console.error('Error fetching regional benchmarks:', error);
    return [];
  }
  return data;
}