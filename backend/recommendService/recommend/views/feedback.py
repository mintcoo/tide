from flask import Blueprint, Response, json, request
from flask_restful import Resource, Api

import pandas as pd


from recommend.models import db, SongCategory, TextFeedback


bp = Blueprint('feedback', __name__, url_prefix='/api/v1/feedback')
api = Api(bp)

class MusicFeedback(Resource):
    def post(self):
        song_id = request.json['songId']
        emo_idx = request.json['emotion']
        req = SongCategory.query.filter(SongCategory.song_id == song_id).first()
        req_list = req.as_list()
        
        
        if sum(req_list) <= 190:
            if emo_idx == 0:
                req.sadly += 10
            elif emo_idx == 1:
                req.calm += 10
            elif emo_idx == 2:
                req.love += 10
            elif emo_idx == 3:
                req.farewell += 10
            elif emo_idx == 4:
                req.cool += 10
            elif emo_idx == 5:
                req.mywqy += 10
            elif emo_idx == 6:
                req.commic += 10
            elif emo_idx == 7:
                req.anger += 10
            elif emo_idx == 8:
                req.exciting += 10
        
        elif sum(req_list) <= 240:
            if emo_idx == 0:
                req.sadly += 5
            elif emo_idx == 1:
                req.calm += 5
            elif emo_idx == 2:
                req.love += 5
            elif emo_idx == 3:
                req.farewell += 5
            elif emo_idx == 4:
                req.cool += 5
            elif emo_idx == 5:
                req.mywqy += 5
            elif emo_idx == 6:
                req.commic += 5
            elif emo_idx == 7:
                req.anger += 5
            elif emo_idx == 8:
                req.exciting += 5
        
        elif sum(req_list) <= 290:
            if emo_idx == 0:
                req.sadly += 1
            elif emo_idx == 1:
                req.calm += 1
            elif emo_idx == 2:
                req.love += 1
            elif emo_idx == 3:
                req.farewell += 1
            elif emo_idx == 4:
                req.cool += 1
            elif emo_idx == 5:
                req.mywqy += 1
            elif emo_idx == 6:
                req.commic += 1
            elif emo_idx == 7:
                req.anger += 1
            elif emo_idx == 8:
                req.exciting += 1
        
        db.session.commit()
        
        return {1:1}


class TextLabelFeedback(Resource):
    def post(self):
        user_id = request.json['userId']
        text = request.json['text']
        emotion_label = request.json['emotionLabel']
        
        text_feedback = TextFeedback()
        
        text_feedback.text = text
        text_feedback.user_id = user_id
        text_feedback.emotion_label = emotion_label
        
        
        db.session.add(text_feedback)
        db.session.commit()
        
        return {'status' : 200}
        
        
        

api.add_resource(MusicFeedback, '/musicemotion')
api.add_resource(TextLabelFeedback, '/textfeedback')