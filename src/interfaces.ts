export type Connection = {
	id: string
	groupId: number
	groupName: string
	driver: string
	name: string
	isSocket: boolean
	isOverSSH: boolean
	ServerAddress: string
	database: string
	Enviroment: string
};

export type Group = {
	id: string,
	name: string
}

export type Datas = {
	id: string,
	data: Connection[]
}
