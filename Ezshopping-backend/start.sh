#!/bin/bash

# �滻 server.js �е� 'fakeflag' �ַ���Ϊ�������� GZCTF_FLAG ��ֵ
sed -i "s/fakeflag/${GZCTF_FLAG}/g" server.js

# ���� Node.js Ӧ��
node server.js
