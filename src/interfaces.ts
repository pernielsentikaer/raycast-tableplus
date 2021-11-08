export type Connection = {
	type: 'connection';
	id: string
	groupId: string
	groupName: string
	driver: string
	name: string
	isSocket: boolean
	isOverSSH: boolean
	ServerAddress: string
	DatabaseHost: string
	database: string
	Driver: string
	Enviroment: string
};

export type Group = {
	type: 'group';
	id: string,
	name: string,
	connections: Connection[]
}

export type ListItem = Connection | Group;
