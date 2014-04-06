#!/bin/env python
from pymongo import MongoClient
import MySQLdb as mdb
import json
import pprint
import sys

names = []

client = MongoClient()
db = client.gdelt
collection = db.summary

"""
with open("country_codes.json") as f:
    s = json.load(f)

with open("iso.txt", "w") as f:
    for x in s:
        names.append(x["alpha-3"])
        f.write(x["alpha-3"] + "\n")
"""
with open("iso.txt") as f:
    names = f.readlines()
    names = [n.strip() for n in names]

conn = mdb.connect(host='127.0.0.1', port=3306, user='root',passwd='toor',db='gdelt')
cur = conn.cursor()

conflict_summary = {}




for year in xrange(1979, 2001):
    print "Creating temporary table for year", year
    temp = "CREATE TABLE IF NOT EXISTS gdelt_temp AS (SELECT * FROM gdelt WHERE YEAR(conflict_date)='{year}')".format(year=year)
    #count = "SELECT COUNT(*) FROM gdelt WHERE conflict_date LIKE '{year}%' AND source_country='{actor}' AND target_country='{recip}'".format(year=year,actor=actor,recip=recip)
    cur.execute(temp)
    conn.commit()
    print "Temporary table created!"

    for actor in names:
        print "Starting with actor: {}".format(actor)
        print "Summary size", sys.getsizeof(conflict_summary)
        for i, recip in enumerate(names):
            if actor == recip:
                continue
            
            count = "SELECT goldstein, count(goldstein) FROM gdelt_temp WHERE source_country='{}' AND target_country='{}' GROUP BY goldstein".format(actor, recip)
            cur.execute(count)
            
            results = cur.fetchall()
            if not results:
                print "no results for {}".format(recip)
                continue
            conflict_summary.setdefault(year, {})\
                            .setdefault(actor, {})\
                            .setdefault(recip, {})
            for r in results:
                conflict_summary[year][actor][recip][r[0]] = r[1]
        try:
            collection.insert(
        cur.execute("DROP TABLE gdelt_temp")
        conn.commit()

conn.close()

print "Done. Dumping file..."
with open('just_in_case.json', 'w') as f:
    json.dump(conflict_summary, f)
