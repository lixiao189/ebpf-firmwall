import joblib
import os
import urllib.parse

from sklearn.feature_extraction.text import TfidfVectorizer


def load(name):
    filepath = os.path.join(str(os.getcwd()), name)
    with open(filepath, 'r', encoding="utf-8") as f:
        alldata = f.readlines()
    queries = []
    for i in alldata:
        i = str(urllib.parse.unquote(i))
        queries.append(i)
    return queries

def task():
    pass

def main():
    # 加载数据
    goodqueries = load('./data/goodqueries.data')
    badqueries = load('./data/badqueries.data')

    # 创建向量化工具
    vectorizer = TfidfVectorizer()
    vectorizer.fit(goodqueries + badqueries)

    # 向量化用户输入
    user_input = "1' or '1'='1'"
    X = vectorizer.transform([user_input])

    # 加载模型
    model = joblib.load('./model/lr.pkl')
    y = model.predict(X)
    print(y)


if __name__ == '__main__':
    main()
