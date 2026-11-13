import json
import os
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from unittest.mock import patch
import app

class FakeProvider(BaseHTTPRequestHandler):
    response = {'supported': True, 'passage_ids': ['2.2']}
    def log_message(self, *args): pass
    def do_POST(self):
        request = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        assert self.path == '/v1/chat/completions'
        assert request['messages'][1]['content'] == 'When is group coaching?'
        self.send_response(200)
        self.end_headers()
        self.wfile.write(json.dumps({'choices':[{'message':{'content':json.dumps(self.response)}}]}).encode())

class Tests(unittest.TestCase):
    def test_supported(self):
        result = app.answer('When is group coaching?')
        self.assertIn('Tuesday at 16:00 UTC', result['answer'])
        self.assertEqual(result['sources'][0]['id'], 2)
    def test_unknown(self):
        result = app.answer('What is the refund policy?')
        self.assertFalse(result['supported'])
        self.assertEqual(result['sources'], [])
        self.assertIn('not available', result['answer'])
    def test_failure(self):
        with self.assertRaises(app.ModelUnavailable):
            app.answer('When is coaching?', simulate_failure=True)
    def test_validation(self):
        for question in ['', None, 'x'*2001]:
            with self.assertRaises(ValueError): app.answer(question)
    def test_model_transport_and_invalid_citation(self):
        server = ThreadingHTTPServer(('127.0.0.1',0), FakeProvider)
        thread = threading.Thread(target=server.serve_forever,daemon=True)
        thread.start()
        try:
            with patch.dict(os.environ, {'MODEL_BASE_URL':f'http://127.0.0.1:{server.server_port}/v1'}):
                FakeProvider.response = {'supported':True,'passage_ids':['2.2']}
                self.assertEqual(app.answer('When is group coaching?', 'model')['sources'][0]['id'],2)
                FakeProvider.response = {'supported':True,'passage_ids':['99.9']}
                with self.assertRaises(app.ModelUnavailable): app.answer('When is group coaching?', 'model')
                FakeProvider.response = {'supported':False,'passage_ids':[]}
                self.assertFalse(app.answer('When is group coaching?', 'model')['supported'])
        finally:
            server.shutdown(); server.server_close(); thread.join()
    def test_unavailable_model(self):
        with patch('urllib.request.urlopen', side_effect=TimeoutError()):
            with self.assertRaises(app.ModelUnavailable): app.answer('When is coaching?', 'model')

if __name__ == '__main__': unittest.main(verbosity=2)
