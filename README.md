# bitexen-chart
<h3>
<strong>Disclaimer:</strong> 
</h3>

This project does not have any relation with bitexen.com. It is just made for learning purposes. Graph can be wrong and might misguide you. Do not take it as a investment advice.

<h3>
Commercial Use:
</h3>
Code of the graphic taken from CanvasJS. I highly suggest you to not use BITEXEN-CHART in a "commercial use". It may cause you some copyright issues because I dont have CanvasJS license.

<h3>
About BITEXEN-CHART:
</h3>

I suck at Javascript, Front-End and Back-End development so my code might be inefficient, wrong and full of errors ( probably errors :( ).
  
  - This project is deployed in Heroku servers.
  - I also suck at git and GitHub so files of the project might be lost and not uploaded here. Contact me if you have any problems.
  - I use Bitexen API to gather data, write them as a JSON file for every minute.
  - Graph gets data from my API and projects it in to the graph.
  

<h3>
Current APIs:
</h3>

- www.bitexen-chart.herokuapp.com/api/daily : Returns you a daily data of the day.
- www.bitexen-chart.herokuapp.com/api/"DAY"/"MONTH"/"YEAR" : Returns you the file of a specific day. 
    - Example : www.bitexen-chart.herokuapp.com/api/1/2/2018 returns 1.2.2018.json.
    - If the expected file is not saved into the servers it will let you know that the file does not exist.
    - If you asked for an invalid day (e.g 30.02.2018) it will give a error massage that invalid date.
- www.bitexen-chart.herokuapp.com/api/seconds : Returns you the current price of the BITEXEN.

<h3>
Working on:
</h3>

  - Weekly data by proccessing daily datas.
  - More consistent server. (Time zone issues)
  - Creating graphs out of weekly, and specific date (e.g. www.bitexen-chart.herokuapp.com/api/"DAY"/"MONTH"/"YEAR") data. 
