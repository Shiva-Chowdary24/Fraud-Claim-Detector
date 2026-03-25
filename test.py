WARNING:  WatchFiles detected changes in 'main.py'. Reloading...
 INFO:     Shutting down
INFO:     Waiting for application shutdown.
INFO:     Application shutdown complete.
INFO:     Finished server process [19760]
2026-03-25 11:24:47,514 | INFO | predict | [STARTUP] Loading model artifacts from C:\Users\manda.shiva\Downloads\fraud_detect\backend\artifacts
2026-03-25 11:24:49,048 | INFO | predict | [STARTUP] Artifacts loaded. Features: ['insured_age', 'num_prior_claims', 'policy_tenure_months', 'life_sum_assured', 'annual_premium', 'deductible', 'claim_amount', 'days_to_report', 'policy_age_days_at_incident', 'incident_weekday', 'incident_month', 'report_weekday', 'report_month', 'incident_hour', 'claim_to_premium_ratio', 'deductible_to_claim_ratio', 'premium_per_month', 'prior_claim_rate', 'vehicle_age', 'property_age', 'is_new_policy_90d', 'is_late_report_14d', 'is_online', 'is_cash_or_crypto', 'police_reported_flag', 'injury_severe_flag', 'te_policy_type', 'te_coverage_type', 'te_customer_segment', 'te_channel', 'te_payment_method', 'te_geo_region', 'te_property_type', 'te_diagnosis_group', 'te_provider_specialty', 'te_life_product', 'te_vehicle_make', 'te_vehicle_model', 'te_injury_severity', 'te_police_reported']
✅ DEBUG: Support System router loaded
INFO:     Started server process [16908]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
Fetched 0 notifications for recipient_id
INFO:     127.0.0.1:56685 - "GET /notifications/get/ADMIN HTTP/1.1" 200 OK
Fetched 0 notifications for recipient_id
INFO:     127.0.0.1:57991 - "GET /notifications/get/ADMIN HTTP/1.1" 200 OK
INFO:     127.0.0.1:55493 - "OPTIONS /admin/logs HTTP/1.1" 200 OK
Fetched 0 notifications for recipient_id
INFO:     127.0.0.1:57991 - "GET /notifications/get/ADMIN HTTP/1.1" 200 OK
INFO:     127.0.0.1:55493 - "GET /admin/logs HTTP/1.1" 200 OK
INFO:     127.0.0.1:55493 - "OPTIONS /admin/logs/update-status HTTP/1.1" 200 OK
INFO:     127.0.0.1:57991 - "POST /admin/logs/update-status HTTP/1.1" 200 OK
INFO:     127.0.0.1:57991 - "OPTIONS /notifications/add HTTP/1.1" 200 OK
INFO:     127.0.0.1:55493 - "POST /notifications/add HTTP/1.1" 200 OK
INFO:     127.0.0.1:55493 - "GET /admin/logs HTTP/1.1" 200 OK
INFO:     127.0.0.1:61301 - "OPTIONS /customer/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:61301 - "POST /customer/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:61301 - "OPTIONS /notifications/get/916494 HTTP/1.1" 200 OK
Fetched 2 notifications for recipient_id
INFO:     127.0.0.1:61301 - "GET /notifications/get/916494 HTTP/1.1" 200 OK
INFO:     127.0.0.1:56314 - "OPTIONS /customer/notifications/clear-all?recipient_id=916494 HTTP/1.1" 200 OK
INFO:     127.0.0.1:56314 - "DELETE /customer/notifications/clear-all?recipient_id=916494 HTTP/1.1" 200 OK
Fetched 0 notifications for recipient_id
INFO:     127.0.0.1:56314 - "GET /notifications/get/916494 HTTP/1.1" 200 OK
Fetched 0 notifications for recipient_id
INFO:     127.0.0.1:56314 - "GET /notifications/get/916494 HTTP/1.1" 200 OK
INFO:     127.0.0.1:56314 - "OPTIONS /customer/issued-policies?customer_id=916494 HTTP/1.1" 200 OK
INFO:     127.0.0.1:56314 - "GET /customer/issued-policies?customer_id=916494 HTTP/1.1" 200 OK
Fetched 0 notifications for recipient_id
INFO:     127.0.0.1:51746 - "GET /notifications/get/916494 HTTP/1.1" 200 OK
Fetched 0 notifications for recipient_id
INFO:     127.0.0.1:51746 - "GET /notifications/get/916494 HTTP/1.1" 200 OK
Fetched 0 notifications for recipient_id
INFO:     127.0.0.1:49895 - "GET /notifications/get/916494 HTTP/1.1" 200 OK
Fetched 0 notifications for recipient_id
INFO:     127.0.0.1:60583 - "GET /notifications/get/916494 HTTP/1.1" 200 OK
Fetched 0 notifications for recipient_id
INFO:     127.0.0.1:62336 - "GET /notifications/get/916494 HTTP/1.1" 200 OK
Fetched 0 notifications for recipient_id
INFO:     127.0.0.1:60198 - "GET /notifications/get/916494 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60198 - "OPTIONS /predict HTTP/1.1" 200 OK
2026-03-25 11:27:08,683 | INFO | predict | [PREDICT][69c379349511f3f76cf69038] Processing Request
C:\Users\manda.shiva\AppData\Roaming\Python\Python314\site-packages\joblib\externals\loky\backend\context.py:131: UserWarning: Could not find the number of physical cores for the following reason:
[WinError 2] The system cannot find the file specified
Returning the number of logical cores instead. You can silence this warning by setting LOKY_MAX_CPU_COUNT to the number of cores you want to use.
  warnings.warn(
  File "C:\Users\manda.shiva\AppData\Roaming\Python\Python314\site-packages\joblib\externals\loky\backend\context.py", line 247, in _count_physical_cores
    cpu_count_physical = _count_physical_cores_win32()
  File "C:\Users\manda.shiva\AppData\Roaming\Python\Python314\site-packages\joblib\externals\loky\backend\context.py", line 299, in _count_physical_cores_win32
    cpu_info = subprocess.run(
        "wmic CPU Get NumberOfCores /Format:csv".split(),
        capture_output=True,
        text=True,
    )
  File "C:\Program Files\Python314\Lib\subprocess.py", line 554, in run
    with Popen(*popenargs, **kwargs) as process:
         ~~~~~^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Program Files\Python314\Lib\subprocess.py", line 1038, in __init__
    self._execute_child(args, executable, preexec_fn, close_fds,
    ~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                        pass_fds, cwd, env,
                        ^^^^^^^^^^^^^^^^^^^
    ...<5 lines>...
                        gid, gids, uid, umask,
                        ^^^^^^^^^^^^^^^^^^^^^^
                        start_new_session, process_group)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Program Files\Python314\Lib\subprocess.py", line 1552, in _execute_child
    hp, ht, pid, tid = _winapi.CreateProcess(executable, args,
                       ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^
                             # no special security
                             ^^^^^^^^^^^^^^^^^^^^^
    ...<4 lines>...
                             cwd,
                             ^^^^
                             startupinfo)
                             ^^^^^^^^^^^^
2026-03-25 11:27:08,744 | INFO | predict | [PREDICT][69c379349511f3f76cf69038] Result: pred=1 | proba=0.8325 | policy=PL-GOL-4490        
2026-03-25 11:27:08,746 | INFO | predict | [FRAUD_DETECTED] Logged for Customer: 916494
INFO:     127.0.0.1:60198 - "POST /predict HTTP/1.1" 200 OK
INFO:     127.0.0.1:56833 - "OPTIONS /admin/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:56833 - "POST /admin/login HTTP/1.1" 401 Unauthorized
INFO:     127.0.0.1:61784 - "POST /admin/login HTTP/1.1" 200 OK
Fetched 0 notifications for recipient_id
INFO:     127.0.0.1:61784 - "GET /notifications/get/ADMIN HTTP/1.1" 200 OK
Fetched 0 notifications for recipient_id
INFO:     127.0.0.1:61784 - "GET /notifications/get/ADMIN HTTP/1.1" 200 OK
INFO:     127.0.0.1:55231 - "GET /admin/logs HTTP/1.1" 200 OK
INFO:     127.0.0.1:55231 - "POST /admin/logs/update-status HTTP/1.1" 200 OK
INFO:     127.0.0.1:55231 - "POST /notifications/add HTTP/1.1" 200 OK
INFO:     127.0.0.1:55231 - "GET /admin/logs HTTP/1.1" 200 OK
Fetched 0 notifications for recipient_id
