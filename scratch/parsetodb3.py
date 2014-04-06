#!/bin/env python

import pymysql

conn = pymysql.connect(host='127.0.0.1', port=3306, user='root',passwd='toor',db='gdelt')

cur = conn.cursor()

#Columns:
# 1 Date = Required
# 2 Source = Required          <-- Country code only?
# 3 Target = Required          <-- Doesn't look hard to include everything
# 4 Cameocode -- http://cameocodes.wikispaces.com/EventCodes
# 5 NumEvents 
# 6 NumArts ("attention received" rating)
# 7 QuadClass 
# 8 Goldstein
# 9 SourceGeoType
# 10 SourceGeoLat
# 11 SourceGeoLong
# 12 TargetGeoType
# 13 TargetGeoLat
# 14 TargetGeoLong
# 15 ActionGeoType
# 16 ActionGeoLat
# 17 ActionGeoLong
f = open("GDELT.MASTERREDUCEDV2.TXT",'r')
f.readline(); # Skip first line.
f.seek(18000000)
fields = []
i=18000001
for line in f:
  
  fields = line.split('\t')
  try:
      if len(fields) > 16: 
        date = fields[0]
        year = date[0:4]
        month = date[4:6]
        day = date[6:8]
        
        formatted_date = "{}-{}-{}".format(year,month,day)
        source_code = fields[1][0:3]
        target_code = fields[2][0:3]

        cameocode = int(fields[3])
        num_events = int(fields[4])
        num_arts = int(fields[5])
        quadclass = int(fields[6])
        goldstein = float(fields[7])
        # Assuming up to here, fields are guaranteeded

        source_geo_type = 0
        if len(fields[8].strip()) != 0:
          source_geo_type = int(fields[8])
        
        source_geo_lat = 0 
        if len(fields[9].strip()) != 0:
          source_geo_lat = float(fields[9])
         
        source_geo_long = 0
        if len(fields[10].strip()) != 0:
          source_geo_long = float(fields[10])

        target_geo_type = 0
        if len(fields[11].strip()) != 0:
          target_geo_type = int(fields[11])

        target_geo_lat = 0
        if len(fields[12].strip()) != 0:
          target_geo_lat = float(fields[12])

        target_geo_long = 0 
        if len(fields[13].strip()) != 0:
          target_geo_long = float(fields[13])
        
        action_geo_type = 0
        if len(fields[14].strip()) != 0:
          action_geo_type = int(fields[14])


        action_geo_lat = 0
        if len(fields[15].strip()) != 0:
          action_geo_lat = float(fields[15])

        action_geo_long = 0
        if len(fields[16].strip()) != 0:
          action_geo_long = float(fields[16])
  except ValueError:
    continue

    #cur.execute(
    test = "INSERT INTO gdelt (\
conflict_date, source_country,\
target_country, cameo_code,\
num_events, num_arts, quadclass,\
goldstein, source_geo_type,\
source_geo_lat, source_geo_long,\
target_geo_type,target_geo_lat,\
target_geo_long,action_geo_type,\
action_geo_lat,action_geo_long\
) VALUES (\
'{fdate}','{s}','{t}','{cc}',\
'{nenv}','{nart}','{qc}','{gs}',\
'{stype}','{slat}','{slong}',\
'{ttype}','{tlat}','{tlong}',\
'{atype}','{alat}','{along}'\
);".format(fdate = formatted_date,
      s = source_code, t = target_code,
      cc = cameocode,  nenv = num_events,
      nart = num_arts, qc = quadclass, gs = goldstein,
      stype = source_geo_type, slat = source_geo_lat,
      slong = source_geo_long, ttype = target_geo_type,
      tlat = target_geo_lat, tlong = target_geo_long,
      atype = action_geo_type, alat = action_geo_lat,
      along = action_geo_long)

    cur.execute(test)
    if i%1000000 == 0:
        print(i, test)
        conn.commit()
    i+=1
conn.close()
    
