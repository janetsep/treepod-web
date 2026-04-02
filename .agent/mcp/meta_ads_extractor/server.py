#!/usr/bin/env python3
"""
MCP Server for Meta Ads Manager
Extracts campaign history, creative performance, and metrics from Meta Ads
"""

import requests
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any

# Meta Ads API Configuration
META_GRAPH_API_URL = "https://graph.instagram.com/v18.0"
ACCESS_TOKEN = "EAAZAI3BLOlMQBRF+1zF09DRZAgZBW04NtiCQ2BZACyk07XgqE3ngftdJed6S4ozZABi"
AD_ACCOUNT_ID = "109284805229920"

def meta_api_call(endpoint: str, method: str = "GET", params: Dict = None) -> Dict[str, Any]:
    """Make a call to Meta Ads API"""
    url = f"{META_GRAPH_API_URL}/{endpoint}"
    
    if params is None:
        params = {}
    
    params["access_token"] = ACCESS_TOKEN
    
    try:
        if method == "GET":
            response = requests.get(url, params=params, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=params, timeout=10)
        else:
            return {"error": f"Unsupported method: {method}"}
        
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": f"API Error: {str(e)}", "status": "failed"}

def get_campaigns() -> str:
    """Get all campaigns from Meta Ads account"""
    fields = "id,name,status,created_time,updated_time,daily_budget,lifetime_budget,start_time,stop_time"
    params = {"fields": fields, "limit": 100}
    
    result = meta_api_call(f"{AD_ACCOUNT_ID}/campaigns", params=params)
    
    if "error" in result:
        return f"Error fetching campaigns: {result['error']}"
    
    campaigns = result.get("data", [])
    
    output = f"**Found {len(campaigns)} campaigns:**\n\n"
    for campaign in campaigns:
        output += f"- **{campaign.get('name', 'Unknown')}** (ID: {campaign['id']})\n"
        output += f"  Status: {campaign.get('status', 'Unknown')}\n"
        output += f"  Created: {campaign.get('created_time', 'N/A')}\n"
        if campaign.get('daily_budget'):
            output += f"  Daily Budget: {campaign.get('daily_budget')} CLP\n"
        if campaign.get('lifetime_budget'):
            output += f"  Total Budget: {campaign.get('lifetime_budget')} CLP\n"
        output += "\n"
    
    return output

def get_campaign_metrics(campaign_id: str, days_back: int = 90) -> str:
    """Get performance metrics for a specific campaign"""
    
    date_to = datetime.now().strftime("%Y-%m-%d")
    date_from = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")
    
    fields = "impressions,clicks,spend,actions,action_values"
    params = {
        "fields": fields,
        "date_start": date_from,
        "date_stop": date_to,
        "time_range": {"since": date_from, "until": date_to}
    }
    
    result = meta_api_call(f"{campaign_id}/insights", params=params)
    
    if "error" in result:
        return f"Error fetching metrics: {result['error']}"
    
    insights = result.get("data", [])
    
    if not insights:
        return f"No data found for campaign {campaign_id}"
    
    # Aggregate metrics
    total_impressions = 0
    total_clicks = 0
    total_spend = 0
    total_conversions = 0
    total_revenue = 0
    
    for insight in insights:
        total_impressions += int(insight.get("impressions", 0))
        total_clicks += int(insight.get("clicks", 0))
        total_spend += float(insight.get("spend", 0))
        
        actions = insight.get("actions", [])
        for action in actions:
            if action.get("action_type") == "purchase":
                total_conversions += int(action.get("value", 0))
        
        action_values = insight.get("action_values", [])
        for av in action_values:
            if av.get("action_type") == "purchase":
                total_revenue += float(av.get("value", 0))
    
    ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
    cpc = (total_spend / total_clicks) if total_clicks > 0 else 0
    cpa = (total_spend / total_conversions) if total_conversions > 0 else 0
    roas = (total_revenue / total_spend) if total_spend > 0 else 0
    
    output = f"**Campaign Metrics: {campaign_id}** ({date_from} to {date_to})\n\n"
    output += f"- Impressions: {total_impressions:,}\n"
    output += f"- Clicks: {total_clicks:,}\n"
    output += f"- CTR: {ctr:.2f}%\n"
    output += f"- Spend: CLP {total_spend:,.2f}\n"
    output += f"- CPC: CLP {cpc:.2f}\n"
    output += f"- Conversions: {total_conversions:,}\n"
    output += f"- CPA: CLP {cpa:.2f}\n"
    output += f"- Revenue: CLP {total_revenue:,.2f}\n"
    output += f"- ROAS: {roas:.2f}x\n"
    
    return output

def analyze_all_campaigns(days_back: int = 90) -> str:
    """Analyze all campaigns to find winners by different metrics"""
    
    # Get all campaigns
    campaigns_result = meta_api_call(f"{AD_ACCOUNT_ID}/campaigns", params={"fields": "id,name", "limit": 100})
    
    if "error" in campaigns_result:
        return f"Error fetching campaigns: {campaigns_result['error']}"
    
    campaigns = campaigns_result.get("data", [])
    
    campaign_data = []
    
    for campaign in campaigns:
        campaign_id = campaign["id"]
        campaign_name = campaign.get("name", "Unknown")
        
        date_to = datetime.now().strftime("%Y-%m-%d")
        date_from = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")
        
        metrics_result = meta_api_call(
            f"{campaign_id}/insights",
            params={
                "fields": "impressions,clicks,spend,actions,action_values",
                "date_start": date_from,
                "date_stop": date_to
            }
        )
        
        if "error" not in metrics_result:
            insights = metrics_result.get("data", [])
            
            total_impressions = sum(int(i.get("impressions", 0)) for i in insights)
            total_clicks = sum(int(i.get("clicks", 0)) for i in insights)
            total_spend = sum(float(i.get("spend", 0)) for i in insights)
            
            total_conversions = 0
            total_revenue = 0
            
            for insight in insights:
                actions = insight.get("actions", [])
                for action in actions:
                    if action.get("action_type") == "purchase":
                        total_conversions += int(action.get("value", 0))
                
                action_values = insight.get("action_values", [])
                for av in action_values:
                    if av.get("action_type") == "purchase":
                        total_revenue += float(av.get("value", 0))
            
            ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
            cpc = (total_spend / total_clicks) if total_clicks > 0 else 0
            cpa = (total_spend / total_conversions) if total_conversions > 0 else 0
            roas = (total_revenue / total_spend) if total_spend > 0 else 0
            
            campaign_data.append({
                "name": campaign_name,
                "id": campaign_id,
                "impressions": total_impressions,
                "clicks": total_clicks,
                "spend": total_spend,
                "ctr": ctr,
                "cpc": cpc,
                "conversions": total_conversions,
                "cpa": cpa,
                "roas": roas
            })
    
    # Generate report
    output = f"# 📊 COMPREHENSIVE META ADS ANALYSIS\n\n"
    output += f"**Period:** Last {days_back} days\n"
    output += f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    output += f"## Total Campaigns Analyzed: {len(campaign_data)}\n\n"
    
    if not campaign_data:
        return output + "No campaigns found with data."
    
    # Winners by metric
    output += "## 🏆 WINNERS BY METRIC\n\n"
    
    best_roas = max(campaign_data, key=lambda x: x["roas"])
    best_cpa = min((c for c in campaign_data if c["cpa"] > 0), key=lambda x: x["cpa"], default=None)
    best_ctr = max(campaign_data, key=lambda x: x["ctr"])
    best_cpc = min((c for c in campaign_data if c["cpc"] > 0), key=lambda x: x["cpc"], default=None)
    
    output += f"### Best ROAS\n**{best_roas['name']}** - {best_roas['roas']:.2f}x\n\n"
    
    if best_cpa:
        output += f"### Best CPA (Lowest)\n**{best_cpa['name']}** - CLP {best_cpa['cpa']:.2f}\n\n"
    
    output += f"### Best CTR\n**{best_ctr['name']}** - {best_ctr['ctr']:.2f}%\n\n"
    
    if best_cpc:
        output += f"### Best CPC (Lowest)\n**{best_cpc['name']}** - CLP {best_cpc['cpc']:.2f}\n\n"
    
    # All campaigns sorted by ROAS
    output += "## 📈 ALL CAMPAIGNS (sorted by ROAS)\n\n"
    
    for data in sorted(campaign_data, key=lambda x: x["roas"], reverse=True):
        output += f"### {data['name']}\n"
        output += f"- Impressions: {data['impressions']:,}\n"
        output += f"- Clicks: {data['clicks']:,}\n"
        output += f"- CTR: {data['ctr']:.2f}%\n"
        output += f"- Spend: CLP {data['spend']:,.2f}\n"
        output += f"- CPC: CLP {data['cpc']:.2f}\n"
        output += f"- Conversions: {data['conversions']:,}\n"
        output += f"- CPA: CLP {data['cpa']:.2f}\n"
        output += f"- **ROAS: {data['roas']:.2f}x**\n\n"
    
    return output

if __name__ == "__main__":
    print("=== GET ALL CAMPAIGNS ===")
    print(get_campaigns())
    print("\n=== ANALYZE ALL CAMPAIGNS ===")
    print(analyze_all_campaigns())
